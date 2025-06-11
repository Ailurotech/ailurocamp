// Assessment type that matches the database model
export type AssessmentType = 'quiz' | 'assignment';

// Question types supported by Assessment model
export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'short-answer'
  | 'essay';

// Question structure for Assessment
export type AssessmentQuestion = {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
};

// Submission structure
export type AssessmentSubmission = {
  student: string;
  answers: {
    questionIndex: number;
    answer: string | string[];
  }[];
  score?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
};

// Main Assessment type that matches the database model
export type Assessment = {
  id: string;
  title: string;
  course: string;
  type: AssessmentType;
  description: string;
  dueDate?: Date;
  totalPoints: number;
  questions?: AssessmentQuestion[];
  submissions: AssessmentSubmission[];
  createdAt: Date;
  updatedAt: Date;
};

// Legacy types for backward compatibility (将逐步移除)
export type TestCase = {
  input: string;
  output: string;
  file?: string | null;
};

export type Question = {
  id: string;
  type: 'multiple-choice' | 'coding' | 'file-upload' | 'essay';
  title: string;
  points: number;
  choices?: { value: string; label: string }[];
  testCases?: TestCase[];
  fileType?: string;
  uploadedFile?: File;
  placeholder?: string;
};

export type Assignment = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  dueDate: string;
  points: number;
  timeLimit?: number;
  passingScore?: number;
  courseId?: string;
  createdAt: string;
  updatedAt: string;
};

// API request/response types to match documentation
export type AssignmentApiRequest = {
  title: string;
  description: string;
  dueDate: string;
  points: number;
  questions?: {
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    options?: string[];
    correctAnswer?: string | string[];
    points: number;
  }[];
};

export type AssignmentApiResponse = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  courseId?: string;
  createdAt?: string;
  updatedAt?: string;
  questions?: {
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    options?: string[];
    correctAnswer?: string | string[];
    points: number;
  }[];
};

export type AssignmentListResponse = {
  assignments: AssignmentApiResponse[];
};
