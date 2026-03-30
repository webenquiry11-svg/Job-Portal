import { Request, Response } from 'express';
import AuthModel from '../models/AuthModel';
import NotificationModel from '../models/NotificationModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;
  try {
    const existingUser = await AuthModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await AuthModel.create({ email, password: hashedPassword, name, role });
    const token = jwt.sign({ email: result.email, id: result._id, role: result.role }, 'test', { expiresIn: '7d' });
    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const existingUser = await AuthModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist" });
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
  const updates = req.body;

  if (req.file) {
    if (req.file.fieldname === 'resume') {
        updates.resume = req.file.path;
    } else {
        updates.profilePicture = req.file.path;
    }
  }
  delete updates._id;

  try {
    const updatedUser = await AuthModel.findByIdAndUpdate(_id, updates, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ result: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const otpStore: { [key: string]: { otp: string; expires: number } } = {};

export const requestOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await AuthModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 minutes
    console.log(`OTP for ${email}: ${otp}`); // In a real app, send this via email/SMS
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const stored = otpStore[email];
    if (!stored || stored.expires < Date.now() || stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    delete otpStore[email];
    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const sendAdminOtp = async (req: Request, res: Response) => res.status(501).json({ message: "Not implemented" });
export const verifyAdminOtp = async (req: Request, res: Response) => res.status(501).json({ message: "Not implemented" });
export const requestGstVerification = async (req: Request, res: Response) => res.status(501).json({ message: "Not implemented" });
export const getPendingGstVerifications = async (req: Request, res: Response) => res.status(501).json({ message: "Not implemented" });
export const updateGstVerificationStatus = async (req: Request, res: Response) => res.status(501).json({ message: "Not implemented" });

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
    const user = await AuthModel.findByIdAndUpdate(id, { $inc: { profileViews: 1 } }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ profileViews: (user as any).profileViews });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to increment profile view count', error: error.message });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await AuthModel.findById(id).select('-password');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch company data', error: error.message });
  }
};