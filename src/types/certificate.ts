// src/types/certificate.ts


export interface CertificateDocument {
  /** MongoDB document ID (optional when creating) */
  _id?: string;

  /** Email or unique ID of the user who owns this certificate */
  userId: string;

  /** The name/title of the course completed */
  courseTitle: string;

  /** ISO-formatted date string representing completion time */
  completedAt: string;

  /** Unique identifier of the certificate, used for public referencing */
  certificateId: string;

  /** Document creation timestamp (managed by Mongoose) */
  createdAt?: string;

  /** Document update timestamp (managed by Mongoose) */
  updatedAt?: string;
}


export interface Certificate {
  /** The name/title of the course completed */
  courseTitle: string;

  /** ISO-formatted date string representing completion time */
  completedAt: string;

  /** Unique identifier of the certificate */
  certificateId: string;
}

export interface CertificateInput {
  /** The name/title of the course completed (required) */
  courseTitle: string;

  /** ISO-formatted date string (e.g., "2024-05-01") indicating completion date */
  completedAt: string;

  /** Unique alphanumeric ID for this certificate (must match validation rules) */
  certificateId: string;
}
