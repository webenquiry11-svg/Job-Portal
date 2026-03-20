import { Request, Response } from 'express';
import AuthModel from '../models/AuthModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'careerhrconnect26@gmail.com',
          pass: process.env.EMAIL_APP_PASSWORD || '' // Fetched securely from your .env
        }
      });

      await transporter.sendMail({
        from: '"Job Portal Team" <careerhrconnect26@gmail.com>',
        to: user.email,
        subject: 'Job Portal - Your Verification Code',
        html: `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center;">
                 <h2 style="color: #0F172A; margin-bottom: 20px;">Verify your Email Address</h2>
                 <p style="color: #4B5563; font-size: 16px; margin-bottom: 30px;">Please use the verification code below to complete your email verification process:</p>
                 <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #121212;">${otp}</div>
                 <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">If you did not request this, please ignore this email.</p>
               </div>`
      });
    } else {
      console.log(`\n📱 [MOCK] Sending PHONE OTP to user ${_id}: >> ${otp} <<\n`);
    }

    res.status(200).json({ message: `OTP sent successfully to your ${type}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
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