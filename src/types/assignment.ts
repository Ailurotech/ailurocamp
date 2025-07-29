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
  _id?: string;
  id?: string;
  title: string;
  course: string;
  courseId?: string;
  type: 'assignment' | 'quiz';
  description: string;
  dueDate?: Date;
  totalPoints: number;
  points?: number;
  timeLimit?: number;
  maxAttempts?: number;
  passingScore?: number;
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
    id?: string;
    title?: string;
    placeholder?: string;
    choices?: { value: string; label: string }[];
  }[];
  submissions: {
    student: string;
    answers: {
      questionIndex: number;
      questionId?: string;
      answer: string | string[];
    }[];
    score?: number;
    feedback?: string;
    submittedAt: Date;
    gradedAt?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

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

// Dashboard overview type for assignments
export type AssignmentOverview = {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  dueDate?: string;
  points: number;
  isSubmitted?: boolean;
  submissionScore?: number;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
};
