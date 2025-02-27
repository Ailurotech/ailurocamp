import mongoose from 'mongoose';

export interface ICourse extends mongoose.Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  thumbnail?: string;
  modules: {
    title: string;
    content: string;
    order: number;
    duration: number;
  }[];
  enrolledStudents?: mongoose.Types.ObjectId[];
  price: number;
  category: string;
  // level: 'beginner' | 'intermediate' | 'advanced';
  level: string;
  status: 'published' | 'unpublished';
  averageRating: number;
  revenue: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new mongoose.Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    thumbnail: {
      type: String,
    },
    modules: [
      {
        title: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
      // enum: ['beginner', 'intermediate', 'advanced'],
      // default: 'beginner',
    },
    status: {
      type: String,
      enum: ['published', 'unpublished'],
      default: 'unpublished',
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
courseSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Course ||
  mongoose.model<ICourse>('Course', courseSchema);
