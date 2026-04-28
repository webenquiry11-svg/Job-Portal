import mongoose, { Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  industry: string;
  workMode: string;
  location: string;
  skills: string[];
  experience: string;
  salaryMin: number;
  salaryMax: number;
  salaryType: string;
  description: string;
  screeningQuestion?: string;
  immediateJoiner: boolean;
  contactPreference: string;
  employerId: mongoose.Types.ObjectId;
  status: string;
  applicants?: mongoose.Types.ObjectId[];
  applicantDetails?: {
    candidateId: mongoose.Types.ObjectId;
    status: string;
    appliedAt: Date;
    interviewDate?: Date;
    interviewLink?: string;
    interviewDescription?: string;
  }[];
}

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  industry: { type: String, required: true },
  workMode: { type: String, required: true },
  location: { type: String, required: true },
  skills: [{ type: String }],
  experience: { type: String, required: true },
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  salaryType: { type: String },
  description: { type: String, required: true },
  screeningQuestion: { type: String },
  immediateJoiner: { type: Boolean, default: false },
  contactPreference: { type: String },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auth' }],
  applicantDetails: [{
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth' },
    status: { type: String, default: 'Applied' },
    appliedAt: { type: Date, default: Date.now },
    interviewDate: { type: Date },
    
    interviewLink: { type: String },
    interviewDescription: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model<IJob>('Job', jobSchema);