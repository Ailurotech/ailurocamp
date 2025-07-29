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
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  error?: string;
}
