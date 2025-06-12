export type AssessmentType = 'quiz' | 'assignment';

export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'short-answer'
  | 'essay'
  | 'coding'
  | 'file-upload';

export type AssessmentQuestion = {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  testCases?: {
    input: string;
    output: string;
    file?:
      | string
      | {
          name: string;
          url: string;
          size: number;
          type: string;
        };
  }[];
  fileType?: string;
  maxFileSize?: number;
};

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

export type TestCase = {
  input: string;
  output: string;
  file?:
    | string
    | null
    | {
        name: string;
        url: string;
        size: number;
        type: string;
      };
};

export type Question = {
  id: string;
  type:
    | 'multiple-choice'
    | 'true-false'
    | 'short-answer'
    | 'essay'
    | 'coding'
    | 'file-upload';
  title: string;
  points: number;
  choices?: { value: string; label: string }[];
  testCases?: TestCase[];
  fileType?: string;
  uploadedFile?: File;
  placeholder?: string;
  maxFileSize?: number;
  options?: string[];
  correctAnswer?: string | string[];
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
    type:
      | 'multiple-choice'
      | 'true-false'
      | 'short-answer'
      | 'essay'
      | 'coding'
      | 'file-upload';
    options?: string[];
    correctAnswer?: string | string[];
    points: number;
    testCases?: {
      input: string;
      output: string;
      file?:
        | string
        | {
            name: string;
            url: string;
            size: number;
            type: string;
          };
    }[];
    fileType?: string;
    maxFileSize?: number;
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
    type:
      | 'multiple-choice'
      | 'true-false'
      | 'short-answer'
      | 'essay'
      | 'coding'
      | 'file-upload';
    options?: string[];
    correctAnswer?: string | string[];
    points: number;
    testCases?: {
      input: string;
      output: string;
      file?:
        | string
        | {
            name: string;
            url: string;
            size: number;
            type: string;
          };
    }[];
    fileType?: string;
    maxFileSize?: number;
  }[];
};

export type AssignmentListResponse = {
  assignments: AssignmentApiResponse[];
};
