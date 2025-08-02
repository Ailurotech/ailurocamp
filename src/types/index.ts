export interface ErrorResponse {
  message: string;
  error?: Error;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  roles: string[];
  currentRole?: string;
}

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  error?: string;
}

// Re-export assignment types for convenience
export type { AssignmentOverview } from './assignment';

// Re-export submission types for convenience
export type {
  SubmissionData,
  SubmissionRequest,
  SubmissionDocument,
  SubmissionResponse,
} from './submission';
