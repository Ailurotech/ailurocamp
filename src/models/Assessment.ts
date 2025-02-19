import mongoose from 'mongoose';

export interface IAssessment extends mongoose.Document {
  title: string;
  course: mongoose.Types.ObjectId;
  type: 'quiz' | 'assignment';
  description: string;
  dueDate?: Date;
  totalPoints: number;
  questions?: {
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    options?: string[];
    correctAnswer?: string | string[];
    points: number;
  }[];
  submissions: {
    student: mongoose.Types.ObjectId;
    answers: {
      questionIndex: number;
      answer: string | string[];
    }[];
    score?: number;
    feedback?: string;
    submittedAt: Date;
    gradedAt?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new mongoose.Schema<IAssessment>(
  {
    title: {
      type: String,
      required: [true, 'Please provide an assessment title'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    type: {
      type: String,
      enum: ['quiz', 'assignment'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
          required: true,
        },
        options: [
          {
            type: String,
          },
        ],
        correctAnswer: {
          type: mongoose.Schema.Types.Mixed,
        },
        points: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        answers: [
          {
            questionIndex: {
              type: Number,
              required: true,
            },
            answer: {
              type: mongoose.Schema.Types.Mixed,
              required: true,
            },
          },
        ],
        score: {
          type: Number,
          min: 0,
        },
        feedback: {
          type: String,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        gradedAt: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
assessmentSchema.index({ course: 1, type: 1 });
assessmentSchema.index({ 'submissions.student': 1 });

export default mongoose.models.Assessment ||
  mongoose.model<IAssessment>('Assessment', assessmentSchema);
