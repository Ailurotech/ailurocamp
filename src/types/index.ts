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

export interface Enrollment {
  _id: string;
  courseId: string;
  studentId: string;
  enrolledAt: Date;
  progress: number;
}

export interface EnrollmentWithDetails {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    maxEnrollments: number;
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  enrolledAt: string;
  progress: number;
}
