// src/types/certificate.ts

/**
 * CertificateDocument
 *
 * Represents the full certificate document stored in MongoDB.
 * Includes all necessary metadata fields, such as timestamps and user ownership.
 *
 * Used in server-side contexts where MongoDB documents are queried directly.
 */
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

/**
 * Certificate
 *
 * Simplified certificate object used in frontend UI.
 * Contains only fields required for display purposes and client-side logic.
 */
export interface Certificate {
  /** The name/title of the course completed */
  courseTitle: string;

  /** ISO-formatted date string representing completion time */
  completedAt: string;

  /** Unique identifier of the certificate */
  certificateId: string;
}

/**
 * CertificateInput
 *
 * Represents the shape of data expected from client submissions (e.g. POST request payload).
 * This structure is used for input validation and request handling in API routes.
 */
export interface CertificateInput {
  /** The name/title of the course completed (required) */
  courseTitle: string;

  /** ISO-formatted date string (e.g., "2024-05-01") indicating completion date */
  completedAt: string;

  /** Unique alphanumeric ID for this certificate (must match validation rules) */
  certificateId: string;
}
