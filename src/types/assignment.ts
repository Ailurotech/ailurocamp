// question type
export type QuestionType =
  | 'multiple-choice'
  | 'coding'
  | 'file-upload'
  | 'essay';

// test case
type TestCase = {
  input: string;
  output: string;
};

// choice
type Choice = {
  value: string;
  label: string;
};

// question
type Question = {
  id: string;
  type: QuestionType;
  title: string;
  points: number;
  choices?: Choice[]; // multiple choice
  correctAnswer?: string;
  description?: string; // coding
  testCases?: TestCase[];
  fileType?: string; // file upload
  placeholder?: string; // essay
};

// assignment
export type Assignment = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  dueDate: string;
  timeLimit?: number; // minutes
  passingScore?: number;
  createdAt: string;
  updatedAt: string;
};
