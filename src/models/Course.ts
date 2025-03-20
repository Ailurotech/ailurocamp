import mongoose from 'mongoose';

export interface IModule extends mongoose.Types.Subdocument {
  title: string;
  content: string;
  order: number;
  duration: number;
}

export interface ICourse extends mongoose.Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  thumbnail?: string;
  modules: mongoose.Types.DocumentArray<IModule>;
  enrolledStudents: mongoose.Types.ObjectId[];
  price: number;
  category: string;
  level: string;
  status: 'published' | 'unpublished';
  averageRating: number;
  ratingCount: number; // Number of ratings
  ratingSum: number; // Sum of ratings
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
      new mongoose.Schema<IModule>({
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
      }),
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
    ratingCount: {
      type: Number,
      default: 0,
    },
    ratingSum: {
      type: Number,
      default: 0,
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
