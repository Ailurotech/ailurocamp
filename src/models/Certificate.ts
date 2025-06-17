import mongoose, { Schema, Document, models } from 'mongoose';

export interface ICertificate extends Document {
  userId: string;
  courseTitle: string;
  completedAt: Date;
  certificateId: string;
}

const CertificateSchema = new Schema<ICertificate>({
  userId: { type: String, required: true },
  courseTitle: { type: String, required: true },
  completedAt: { type: Date, required: true },
  certificateId: { type: String, required: true, unique: true },
});

const Certificate =
  models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default Certificate;
