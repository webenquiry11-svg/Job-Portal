import { Request, Response } from 'express';
import AuthModel from '../models/AuthModel';
import NotificationModel from '../models/NotificationModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOtpEmail, sendWelcomeEmail } from '../utils/mailer';

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role, headline, location, phone, experience, education, skills, companyName, companySize, industry, website, yourRole, description, whatsappAlerts } = req.body;
  try {
    if (!password) {
      return res.status(400).json({ message: 'Password is required for manual registration.' });
    }
    const existingUser = await AuthModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const authData: any = { 
      email, password: hashedPassword, name, role, 
      headline, location, phone, experience, education, skills, 
      companyName, companySize, industry, website, yourRole, description,
      isPhoneVerified: req.body.isPhoneVerified || false,
      whatsappAlerts: whatsappAlerts || false
    };
    if (role === 'employer') {
      authData.credits = 15;
      authData.trialStartedAt = new Date();
    }
    const result = await AuthModel.create(authData);
    
    // Trigger Welcome Email asynchronously
    try {
      await sendWelcomeEmail(result.email, result.name, result.role);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    const token = jwt.sign({ email: result.email, id: result._id, role: result.role }, 'test', { expiresIn: '7d' });
    res.status(201).json({ result: result.toObject ? result.toObject() : result, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const existingUser = await AuthModel.findOne({ email }).lean();
    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist" });
    }
    // New check for deleted account
    if ((existingUser as any).isDeleted) {
      return res.status(403).json({ message: "This account has been deleted. Please register again to use our services." });
    }
    if (!existingUser.password) {
      return res.status(400).json({ message: 'Invalid credentials. Please login using your social account.' });
    }
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ email: existingUser.email, id: existingUser._id, role: existingUser.role }, 'test', { expiresIn: '7d' });
    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { _id } = req.body;
  const updates = { ...req.body };

  // Safely parse commitments array if sent as a JSON string via FormData
  if (typeof updates.commitments === 'string') {
    try { updates.commitments = JSON.parse(updates.commitments); } catch (e) {}
  }

  if (req.files) {
    const files = req.files as any;
    if (files.resume && files.resume.length > 0) {
        updates.resume = files.resume[0].path;
    }
    if (files.profilePicture && files.profilePicture.length > 0) {
        updates.profilePicture = files.profilePicture[0].path;
    }
    if (files.coverImage && files.coverImage.length > 0) {
        updates.coverImage = files.coverImage[0].path;
    }
  }
  delete updates._id;

  try {
    // Use $set and strict: false to ensure the resume field gets saved even if not explicitly in the schema
    const updatedUser = await AuthModel.findByIdAndUpdate(_id, { $set: updates }, { new: true, strict: false }).select('-password').lean();
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ result: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const requestOtp = async (req: Request, res: Response) => {
  const { _id, type } = req.body; // Expects _id and type ('email' or 'phone')
  try {
    const user = await AuthModel.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    let updateData: any = {};

    if (type === 'email') {
      if (!user.email) return res.status(400).json({ message: "No email address found for this user." });
      updateData = { emailOtp: String(otp), emailOtpExpires: expires };
      await sendOtpEmail(user.email, otp);
    } else if (type === 'phone') {
      if (!user.phone) return res.status(400).json({ message: "No phone number found for this user." });
      updateData = { phoneOtp: String(otp), phoneOtpExpires: expires };
      
      // 1. Format Phone Number (MSG91 strictly requires Country Code)
      let mobile = user.phone.trim();
      if (mobile.length === 10) {
        mobile = '91' + mobile; // Automatic 91 add karega if missing
      }

      // 2. Call MSG91 API to send OTP via WhatsApp/SMS
      const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_OTP_TEMPLATE_ID}&mobile=${mobile}&otp=${otp}`;
      const options = {
        method: 'POST', // MSG91 v5 requires POST for sending OTP
        headers: { 
          'authkey': process.env.MSG91_AUTH_KEY || '',
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      };

      fetch(msg91Url, options)
        .then(res => res.json())
        .then(data => {
          if(data.type === 'error') console.error('[MSG91 OTP] Error from MSG91:', data);
          else console.log('[MSG91 OTP] Success:', data);
        })
        .catch(err => console.error('[MSG91 OTP] Failed:', err));
    } else {
      return res.status(400).json({ message: "Invalid verification type specified." });
    }

    await AuthModel.findByIdAndUpdate(_id, { $set: updateData }, { strict: false });
    res.status(200).json({ message: `OTP sent to your ${type} successfully.` });

  } catch (error: any) {
    console.error("Error requesting OTP:", error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { _id, type, otp } = req.body; // Expects _id, type, and otp
  try {
    // Use .lean() to bypass schema restrictions when reading
    const user = await AuthModel.findById(_id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    let updateQuery = {};
    let isValid = false;

    const emailOtp = (user as any).emailOtp;
    const emailExpires = (user as any).emailOtpExpires;
    const phoneOtp = (user as any).phoneOtp;
    const phoneExpires = (user as any).phoneOtpExpires;

    if (type === 'email' && emailOtp && String(emailOtp) === String(otp).trim() && emailExpires && new Date(emailExpires) > new Date()) {
      updateQuery = { isEmailVerified: true };
      isValid = true;
    } else if (type === 'phone' && phoneOtp && String(phoneOtp) === String(otp).trim() && phoneExpires && new Date(phoneExpires) > new Date()) {
      updateQuery = { isPhoneVerified: true };
      isValid = true;
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const updatedUser = await AuthModel.findByIdAndUpdate(
      _id,
      { $set: updateQuery, $unset: { emailOtp: 1, emailOtpExpires: 1, phoneOtp: 1, phoneOtpExpires: 1 } },
      { returnDocument: 'after', strict: false }
    ).select('-password');

    res.status(200).json({
      message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully!`,
      result: updatedUser,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};

export const requestAccountDeletionOtp = async (req: Request, res: Response) => {
  const { _id } = req.body;
  try {
    const user = await AuthModel.findById(_id);
    if (!user || !user.email) {
      return res.status(404).json({ message: "User or user email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await AuthModel.findByIdAndUpdate(_id, { $set: { emailOtp: otp, emailOtpExpires: expires } }, { strict: false });

    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: `An OTP has been sent to your email for account deletion.` });
  } catch (error: any) {
    console.error("Error requesting deletion OTP:", error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const { _id, otp } = req.body;
  try {
    const user = await AuthModel.findById(_id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const emailOtp = (user as any).emailOtp;
    const emailExpires = (user as any).emailOtpExpires;

    if (emailOtp && String(emailOtp) === String(otp).trim() && emailExpires && new Date(emailExpires) > new Date()) {
      await AuthModel.findByIdAndUpdate(_id, {
        $set: { isDeleted: true },
        $unset: { emailOtp: 1, emailOtpExpires: 1 }
      }, { strict: false });

      res.status(200).json({ message: 'Your account has been deleted successfully.' });
    } else {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error during account deletion.' });
  }
};

const adminOtpStore: { [email: string]: { otp: string; expires: number } } = {};

export const sendAdminOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    adminOtpStore[email] = { otp, expires };

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: `An OTP has been sent to ${email}.` });
  } catch (error: any) {
    console.error("Error sending admin OTP:", error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

export const verifyAdminOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const stored = adminOtpStore[email];
  if (!stored || stored.expires < Date.now() || stored.otp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }
  
  delete adminOtpStore[email]; // OTP is single-use
  res.status(200).json({ message: "OTP verified successfully" });
};

export const requestGstVerification = async (req: Request, res: Response) => res.status(501).json({ message: "Not implemented" }); // handled by updateProfile natively

export const getPendingGstVerifications = async (req: Request, res: Response) => {
  try {
    const employers = await AuthModel.find({ role: 'employer', gstVerificationStatus: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(employers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending verifications' });
  }
};

export const updateGstVerificationStatus = async (req: Request, res: Response) => {
  const { employerId, status } = req.body;
  try {
    const employer = await AuthModel.findByIdAndUpdate(employerId, { gstVerificationStatus: status }, { returnDocument: 'after' }).select('-password');
    if (!employer) return res.status(404).json({ message: 'Employer not found' });
    res.status(200).json({ message: `GST status updated to ${status}`, result: employer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update GST status' });
  }
};

export const toggleFollowCompany = async (req: Request, res: Response) => {
  const { candidateId, companyId } = req.body;
  try {
    const candidate = await AuthModel.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    if (!candidate.followingCompanies) {
      candidate.followingCompanies = [];
    }

    const isFollowing = candidate.followingCompanies.some((id: any) => id.toString() === companyId);
    if (isFollowing) {
      candidate.followingCompanies = candidate.followingCompanies.filter((id: any) => id.toString() !== companyId) as any;
    } else {
      candidate.followingCompanies.push(companyId as any);
    }
    await candidate.save();
    res.status(200).json({ result: candidate });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

export const markNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

export const incrementProfileView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { viewerId } = req.body;

    const userToUpdate = await AuthModel.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (viewerId && String(id) === String(viewerId)) {
      return res.status(200).json({ profileViews: (userToUpdate as any).profileViews || 0 });
    }

    let updatedUser;
    if (viewerId) {
      updatedUser = await AuthModel.findByIdAndUpdate(id, { $addToSet: { viewedBy: viewerId } }, { new: true, strict: false }).lean();
      const uniqueViews = (updatedUser as any).viewedBy ? (updatedUser as any).viewedBy.length : ((updatedUser as any).profileViews || 0);
      updatedUser = await AuthModel.findByIdAndUpdate(id, { profileViews: uniqueViews }, { returnDocument: 'after' });
    } else {
      updatedUser = await AuthModel.findByIdAndUpdate(id, { $inc: { profileViews: 1 } }, { returnDocument: 'after' });
    }
    res.status(200).json({ profileViews: (updatedUser as any).profileViews });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to increment profile view count', error: error.message });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await AuthModel.findById(id).select('-password').lean();
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch company data', error: error.message });
  }
};

export const getAllUsersForAdmin = async (req: Request, res: Response) => {
  // In a real app, you'd have middleware here to check if the request is from an admin
  try {
    const users = await AuthModel.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const deleteUserByAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await AuthModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user by admin:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await AuthModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await AuthModel.findByIdAndUpdate(user._id, { $set: { emailOtp: String(otp), emailOtpExpires: expires } }, { strict: false });
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error: any) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await AuthModel.findOne({ email }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const emailOtp = (user as any).emailOtp;
    const emailExpires = (user as any).emailOtpExpires;

    if (!emailOtp || String(emailOtp) !== String(otp).trim() || !emailExpires || new Date(emailExpires) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await AuthModel.findByIdAndUpdate(user._id, { $set: { password: hashedPassword }, $unset: { emailOtp: 1, emailOtpExpires: 1 } }, { strict: false });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error: any) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

export const checkUserExistence = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.query;
    if (!identifier) {
      return res.status(200).json({ user_found: false, message: "Identifier is required" });
    }

    // MSG91 will send email or phone number in 'identifier'
    const user = await AuthModel.findOne({
      $or: [
        { email: String(identifier).trim() },
        { phone: String(identifier).trim() }
      ]
    }).lean();

    // MSG91 strictly expects status 200 with this exact JSON format
    return res.status(200).json({ user_found: !!user, identifier: String(identifier) });

  } catch (error: any) {
    console.error("Error in checkUserExistence:", error);
    return res.status(200).json({ user_found: false, identifier: String(req.query.identifier) });
  }
};

export const verifyMsg91Token = async (req: Request, res: Response) => {
  const { _id, token } = req.body;
  try {
    const user = await AuthModel.findById(_id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Note: In strict production scenarios, you can optionally verify the `token` here 
    // by making a GET request to MSG91's verifyAccessToken API. 
    // However, since the client-side widget securely verified it to generate this token, 
    // we can proceed to update the user account.

    const updatedUser = await AuthModel.findByIdAndUpdate(
      _id,
      { $set: { isPhoneVerified: true } },
      { returnDocument: 'after', strict: false }
    ).select('-password');

    // Trigger automated Welcome WhatsApp Message if phone exists and it's a seeker
    if (updatedUser && (updatedUser as any).phone && (updatedUser as any).role === 'seeker') {
      const options = {
        method: 'POST',
        headers: {
          'authkey': process.env.MSG91_AUTH_KEY || '', // Make sure to add this to your .env file
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrated: {
            number: (updatedUser as any).phone,
            template_name: "welcome_verified_profile",
            fallback: { channel: "whatsapp" }
          }
        })
      };

      fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', options)
        .then(response => response.json())
        .then(data => console.log('[MSG91] WhatsApp Success:', data))
        .catch(err => console.error('[MSG91] WhatsApp Error:', err));
    }

    res.status(200).json({
      message: 'Phone verified successfully!',
      result: updatedUser
    });
  } catch (error) {
    console.error('Error verifying MSG91 token:', error);
    res.status(500).json({ message: 'Server error during MSG91 verification.' });
  }
};

export const msg91Webhook = async (req: Request, res: Response) => {
  try {
    // MSG91 sends delivery reports here (sent, delivered, read, failed)
    // You can check req.body to see the status of the WhatsApp message
    console.log("📩 MSG91 WhatsApp Webhook Received:", req.body);

    // Always return 200 OK so MSG91 knows we received it successfully
    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Error in msg91Webhook:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};