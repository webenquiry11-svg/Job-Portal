import mongoose, { Document } from 'mongoose';

export interface IAuth extends Document {
  name: string;
  email: string;
  password?: string;
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
  commitments?: { title: string; desc: string }[];
  followingCompanies?: mongoose.Types.ObjectId[];
  followers?: mongoose.Types.ObjectId[];
  resume?: string;
  followersCount?: number;
  profilePicture?: string;
  coverImage?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  showContact?: boolean;
  gstVerificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  gstVerifiedBy?: mongoose.Types.ObjectId; // Admin user ID
  emailOtp?: string;
  phoneOtp?: string;
  gstNumber?: string;
  googleId?: string;
  microsoftId?: string;
}

const authSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional at DB level to cleanly allow OAuth logins
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
  commitments: [{
    title: { type: String },
    desc: { type: String }
  }],
  followingCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }],
  resume: { type: String },
  followersCount: { type: Number, default: 0 },
  profilePicture: { type: String },
  coverImage: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  gstVerificationStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  gstVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }, // Reference to Admin user
  gstNumber: { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  showContact: { type: Boolean, default: true },
  emailOtp: { type: String },
  phoneOtp: { type: String },

  // Social Login fields
  googleId: { type: String },
  microsoftId: { type: String },
}, { timestamps: true });

export default mongoose.model<IAuth>('Auth', authSchema);