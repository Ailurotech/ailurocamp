// 共享的assessment submission相关类型定义

export interface SubmissionData {
  questionIndex: number;
  answer: string | string[];
}

export interface SubmissionRequest {
  studentId: string;
  answers: SubmissionData[];
}

export interface SubmissionDocument {
  _id?: string;
  id?: string;
  student: {
    toString(): string;
  };
  answers: SubmissionData[];
  submittedAt: Date;
  score?: number;
  feedback?: string;
  gradedAt?: Date;
}

export interface SubmissionResponse {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: SubmissionData[];
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
}
