import mongoose from 'mongoose';

export interface IReview extends mongoose.Document {
  courseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  comment?: string;
  rating: number;
  aspectRatings?: {
    contentRating: number;
    instructorRating: number;
    materialsRating: number;
  };
  images?: string[];
  instructorResponse?: string;
  reports?: { userId: mongoose.Types.ObjectId; reason: string; date: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
    },
    aspectRatings: {
      contentRating: { type: Number, min: 1, max: 5 },
      instructorRating: { type: Number, min: 1, max: 5 },
      materialsRating: { type: Number, min: 1, max: 5 },
    },
    images: [{ type: String }],
    instructorResponse: { type: String },
    reports: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review ||
  mongoose.model<IReview>('Review', reviewSchema);
