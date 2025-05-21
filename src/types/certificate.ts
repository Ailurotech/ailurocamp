// src/types/certificate.ts

/**
 * Certificate document stored in the database.
 */
export interface CertificateDocument {
  _id?: string;
  userId: string;
  courseTitle: string;
  completedAt: string;
  certificateId: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Certificate structure used in frontend UI.
 */
export interface Certificate {
  courseTitle: string;
  completedAt: string;
  certificateId: string;
}
