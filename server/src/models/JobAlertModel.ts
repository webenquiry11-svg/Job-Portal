import mongoose, { Document, Schema } from 'mongoose';

export interface IJobAlert extends Document {
  userId: mongoose.Types.ObjectId;
  keyword: string;
  location: string;
  frequency: string;
}

const jobAlertSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  keyword: { type: String, default: '' },
  location: { type: String, default: '' },
  frequency: { type: String, default: 'daily' }
}, { timestamps: true });

export default mongoose.model<IJobAlert>('JobAlert', jobAlertSchema);