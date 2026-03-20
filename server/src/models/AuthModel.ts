import mongoose, { Document } from 'mongoose';

export interface IAuth extends Document {
  name: string;
  email: string;
  password: string;
  role: 'seeker' | 'employer';
  phone?: string;
  location?: string;
  headline?: string;
  experience?: string;
  education?: string;
  skills?: string;
  companyName?: string;
  companySize?: string;
  tagline?: string;
  specialties?: string;
  industry?: string;
  website?: string;
  description?: string;
  yourRole?: string;
  followers?: string;
  commitments?: { title: string; desc: string }[];
  profilePicture?: string;
  coverImage?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  showContact?: boolean;
  emailOtp?: string;
  phoneOtp?: string;
}

const authSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'employer'], required: true },
  
  // Common fields
  phone: { type: String },
  location: { type: String },
  
  // Seeker specific
  headline: { type: String },
  experience: { type: String },
  education: { type: String },
  skills: { type: String },
  
  // Employer specific
  companyName: { type: String },
  companySize: { type: String },
  industry: { type: String },
  tagline: { type: String },
  specialties: { type: String },
  website: { type: String },
  description: { type: String },
  yourRole: { type: String },
  followers: { type: String },
  commitments: [{
    title: { type: String },
    desc: { type: String }
  }],
  profilePicture: { type: String },
  coverImage: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  showContact: { type: Boolean, default: true },
  emailOtp: { type: String },
  phoneOtp: { type: String },
}, { timestamps: true });

export default mongoose.model<IAuth>('Auth', authSchema);