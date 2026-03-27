import { Request, Response } from 'express';
import AuthModel from '../models/AuthModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import twilio from 'twilio';
import NotificationModel from '../models/NotificationModel';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, ...rest } = req.body;

    const existingUser = await AuthModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await AuthModel.create({
      email,
      password: hashedPassword,
      ...rest
    });

    const token = jwt.sign({ email: newUser.email, id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'test', { expiresIn: '1h' });

    res.status(200).json({ result: newUser, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await AuthModel.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET || 'test', { expiresIn: '1h' });

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { _id, ...updates } = req.body;

    if (!_id || _id === 'undefined' || _id === 'null') return res.status(400).json({ message: "Valid User ID is required" });

    const existingUser = await AuthModel.findById(_id);
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    if (updates.email && updates.email !== existingUser.email) {
      updates.isEmailVerified = false;
    }

    if (updates.phone && updates.phone !== existingUser.phone) {
      updates.isPhoneVerified = false;
    }

    if (updates.gstNumber && updates.gstNumber !== existingUser.gstNumber) {
      updates.gstVerificationStatus = 'none'; // Reset status if GST number changes
    }


    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.profilePicture?.length) {
        updates.profilePicture = files.profilePicture[0].path;
      }
      if (files.coverImage?.length) {
        updates.coverImage = files.coverImage[0].path;
      }
    } else if (req.file) {
      updates.profilePicture = req.file.path;
    }

    if (typeof updates.commitments === 'string') {
      try {
        updates.commitments = JSON.parse(updates.commitments);
      } catch (e) {
        console.error("Failed to parse commitments JSON");
      }
    }

    if (updates.showContact !== undefined) {
      updates.showContact = updates.showContact === 'true' || updates.showContact === true;
    }

    const updatedUser = await AuthModel.findByIdAndUpdate(_id, updates, { returnDocument: 'after' });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ email: updatedUser.email, id: updatedUser._id, role: updatedUser.role }, process.env.JWT_SECRET || 'test', { expiresIn: '1h' });

    res.status(200).json({ result: updatedUser, token });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Database update failed", error: error?.message || "Unknown error" });
  }
};


export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { _id, type } = req.body;
    
    const user = await AuthModel.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    
    const updates: any = {};
    if (type === 'email') updates.emailOtp = otp;
    if (type === 'phone') updates.phoneOtp = otp;

    await AuthModel.findByIdAndUpdate(_id, updates);
    
    if (type === 'email') {
      // Automatically remove any spaces or quotes the user might have accidentally pasted in their .env
      const rawPassword = process.env.EMAIL_APP_PASSWORD || '';
      const cleanPassword = rawPassword.replace(/[\s"']/g, ''); // Removes spaces, single quotes, and double quotes
      const senderEmail = process.env.EMAIL_USER || 'careerhrconnect26@gmail.com';

      console.log(`Attempting to send email via SMTP as user: ${senderEmail}`);
      console.log(`🔑 Debug: Cleaned password length is ${cleanPassword.length} characters (Google App Passwords MUST be exactly 16).`);

      if (!cleanPassword) {
        throw new Error("Server email configuration is missing (EMAIL_APP_PASSWORD not set).");
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: senderEmail,
          pass: cleanPassword
        }
      });

      await transporter.sendMail({
        from: `"Job Portal Team" <${senderEmail}>`,
        to: user.email,
        subject: 'Job Portal - Your Verification Code',
        html: `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center;">
                 <h2 style="color: #0F172A; margin-bottom: 20px;">Verify your Email Address</h2>
                 <p style="color: #4B5563; font-size: 16px; margin-bottom: 30px;">Please use the verification code below to complete your email verification process:</p>
                 <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #121212;">${otp}</div>
                 <p style="color: #9CA3AF; font  -size: 14px; margin-top: 30px;">If you did not request this, please ignore this email.</p>
               </div>`
      });
    } else {
      const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
      const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
      const twilioPhone = (process.env.TWILIO_PHONE_NUMBER || '').trim();

      if (twilioSid && twilioToken && twilioPhone) {
        try {
          const twilioClient = twilio(twilioSid, twilioToken);
          await twilioClient.messages.create({
            body: `Your Job Portal verification code is: ${otp}`,
            from: twilioPhone,
            to: user.phone as string
          });
        } catch (phoneError: any) {
          console.error("Twilio Error:", phoneError.message);
          console.log(`\n📱 [FALLBACK MOCK] Sending PHONE OTP to user ${_id}: >> ${otp} <<\n`);
        }
      } else {
        console.log(`\n📱 [MOCK] Sending PHONE OTP to user ${_id}: >> ${otp} <<\n`);
        console.log(`⚠️ TWILIO CREDENTIALS MISSING: Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to .env to send real SMS.`);
      }
    }

    res.status(200).json({ message: `OTP sent successfully to your ${type}` });
  } catch (error: any) {
    console.error("OTP Request Error:", error);
    res.status(500).json({ message: error?.message || "Failed to send OTP via Nodemailer." });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { _id, type, otp } = req.body;
    const user = await AuthModel.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValidEmail = type === 'email' && user.emailOtp === otp;
    const isValidPhone = type === 'phone' && user.phoneOtp === otp;

    if (!isValidEmail && !isValidPhone) return res.status(400).json({ message: "Invalid OTP provided" });

    const updates = type === 'email' ? { isEmailVerified: true, emailOtp: null } : { isPhoneVerified: true, phoneOtp: null };
    const updatedUser = await AuthModel.findByIdAndUpdate(_id, updates, { returnDocument: 'after' });

    res.status(200).json({ result: updatedUser, message: `${type} verified successfully!` });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// --- GST Verification Logic ---
export const requestGstVerification = async (req: Request, res: Response) => {
  try {
    const { employerId, gstNumber } = req.body;

    if (!employerId || !gstNumber) {
      return res.status(400).json({ message: "Employer ID and GST Number are required." });
    }

    const employer = await AuthModel.findById(employerId);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found." });
    }

    // Update GST number and set status to pending
    employer.gstNumber = gstNumber;
    employer.gstVerificationStatus = 'pending';
    employer.gstVerifiedBy = undefined; // Clear previous admin if any
    await employer.save();

    // TODO: Notify admin about new pending GST verification
    console.log(`Admin Notification: Employer ${employer.companyName || employer.name} (${employerId}) requested GST verification for ${gstNumber}.`);

    res.status(200).json({ message: "GST verification request submitted successfully.", gstVerificationStatus: 'pending' });
  } catch (error: any) {
    console.error("Request GST Verification Error:", error);
    res.status(500).json({ message: "Failed to submit GST verification request.", error: error.message });
  }
};

export const getPendingGstVerifications = async (req: Request, res: Response) => {
  try {
    const pendingVerifications = await AuthModel.find({ role: 'employer', gstVerificationStatus: 'pending' })
      .select('companyName gstNumber email phone location'); // Select relevant fields

    res.status(200).json({ pendingVerifications });
  } catch (error: any) {
    console.error("Get Pending GST Verifications Error:", error);
    res.status(500).json({ message: "Failed to fetch pending GST verifications.", error: error.message });
  }
};

export const updateGstVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { employerId, status, adminId } = req.body; // status can be 'approved' or 'rejected'

    if (!employerId || !status || !adminId) {
      return res.status(400).json({ message: "Employer ID, status, and Admin ID are required." });
    }
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    const employer = await AuthModel.findById(employerId);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found." });
    }

    employer.gstVerificationStatus = status;
    employer.gstVerifiedBy = new mongoose.Types.ObjectId(adminId); // Assuming adminId is a valid ObjectId
    await employer.save();

    res.status(200).json({ message: `GST verification ${status} for ${employer.companyName || employer.name}.`, employer });
  } catch (error: any) {
    console.error("Update GST Verification Status Error:", error);
    res.status(500).json({ message: "Failed to update GST verification status.", error: error.message });
  }
};

// --- ADMIN OTP LOGIC (Existing) ---
const adminOtps = new Map<string, string>(); // In-memory store for admin OTPs

export const sendAdminOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    adminOtps.set(email, otp);

    const rawPassword = process.env.EMAIL_APP_PASSWORD || '';
    const cleanPassword = rawPassword.replace(/[\s"']/g, '');
    const senderEmail = process.env.EMAIL_USER || 'careerhrconnect26@gmail.com';

    if (!cleanPassword) {
      throw new Error("Server email configuration is missing (EMAIL_APP_PASSWORD not set).");
    }
    if (cleanPassword.length !== 16) {
      throw new Error("EMAIL_APP_PASSWORD must be a 16-character Google App Password.");
    }


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: senderEmail, pass: cleanPassword }
    });

    await transporter.sendMail({
      from: `"Job Portal Admin" <${senderEmail}>`,
      to: email,
      subject: 'Admin Portal - Verification Code',
      html: `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center;">
               <h2 style="color: #0F172A; margin-bottom: 20px;">Admin Security Request</h2>
               <p style="color: #4B5563; font-size: 16px; margin-bottom: 30px;">Use the verification code below to authorize changes to your admin account:</p>
               <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #121212;">${otp}</div>
             </div>`
    });
    res.status(200).json({ message: "OTP sent to admin email" });
  } catch (error: any) {
    console.error("Admin OTP Error:", error.message);
    res.status(500).json({ message: "Failed to send admin OTP", error: error.message });
  }
};

export const verifyAdminOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (adminOtps.get(email) === otp) {
    adminOtps.delete(email); // clear OTP after success
    res.status(200).json({ message: "OTP verified successfully!" });
  } else {
    res.status(400).json({ message: "Invalid OTP provided." });
  }
};

export const toggleFollowCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params;
  // In a real app, this would come from `req.userId` set by auth middleware
  const { userId: candidateId } = req.body;

  if (!candidateId) {
    return res.status(401).json({ message: 'Unauthenticated. User ID missing.' });
  }

  try {
    const candidate = await AuthModel.findById(candidateId);
    const company = await AuthModel.findById(companyId);

    if (!candidate || candidate.role !== 'seeker') {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    if (!company || company.role !== 'employer') {
      return res.status(404).json({ message: 'Company not found' });
    }

    const isFollowing = candidate.followingCompanies?.some(id => id.toString() === companyId);

    if (isFollowing) {
      // Unfollow
      candidate.followingCompanies = candidate.followingCompanies?.filter(id => id.toString() !== companyId);
    } else {
      // Follow
      if (!candidate.followingCompanies) {
        candidate.followingCompanies = [];
      }
      candidate.followingCompanies.push(new mongoose.Types.ObjectId(companyId as string));
    }

    await candidate.save();
    const updatedCandidate = await AuthModel.findById(candidateId).select('-password -emailOtp -phoneOtp');

    res.status(200).json({ result: updatedCandidate });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markNotificationsAsRead = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await NotificationModel.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update notifications', error: error.message });
  }
};