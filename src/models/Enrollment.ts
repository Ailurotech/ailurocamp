import mongoose, { Document, Schema } from 'mongoose';

interface EnrollmentDocument extends Document {
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  progress: number;
}

const enrollmentSchema = new Schema<EnrollmentDocument>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
});

export const Enrollment =
  mongoose.models.Enrollment ||
  mongoose.model<EnrollmentDocument>('Enrollment', enrollmentSchema);
export type { EnrollmentDocument };
