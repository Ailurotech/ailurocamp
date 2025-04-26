import mongoose from 'mongoose';

export interface IStudentProgress extends mongoose.Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;

  completedModules: {
    moduleIndex: number;
    completedAt: Date;
    timeSpent: number;
    lastPosition?: number;
  }[];

  completedLessons: {
    moduleIndex: number;
    lessonIndex: number;
    completed: boolean;
    startedAt: Date;
    completedAt?: Date;
    timeSpent: number;
    lastPosition?: number;
  }[];
  overallProgress: number;
  lastAccessedAt: Date;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentProgressSchema = new mongoose.Schema<IStudentProgress>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedModules: [
      {
        moduleIndex: {
          type: Number,
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        timeSpent: {
          type: Number,
          default: 0,
        },
        lastPosition: {
          type: Number,
        },
      },
    ],

    completedLessons: [
      {
        moduleIndex: {
          type: Number,
          required: true,
        },
        lessonIndex: {
          type: Number,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        startedAt: {
          type: Date,
          default: Date.now,
        },
        completedAt: {
          type: Date,
        },
        timeSpent: {
          type: Number,
          default: 0,
        },
        lastPosition: {
          type: Number,
        },
      },
    ],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

studentProgressSchema.index({ student: 1, course: 1 }, { unique: true });

studentProgressSchema.index({
  'completedLessons.moduleIndex': 1,
  'completedLessons.lessonIndex': 1,
});

export default mongoose.models.StudentProgress ||
  mongoose.model<IStudentProgress>('StudentProgress', studentProgressSchema);
