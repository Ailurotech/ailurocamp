// question type
export type QuestionType =
  | 'multiple-choice'
  | 'coding'
  | 'file-upload'
  | 'essay';

// question
export type Question = {
  id: string;
  type: QuestionType;
  title: string;
  points: number;
  choices?: { value: string; label: string }[];
  testCases?: { input: string; output: string }[];
  fileType?: string;
  uploadedFile?: File;
  placeholder?: string;
};

// assignment
export type Assignment = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  dueDate: string;
  timeLimit?: number;
  passingScore?: number;
  createdAt: string;
  updatedAt: string;
};
