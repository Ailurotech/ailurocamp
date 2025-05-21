// src/lib/validation/certificate.ts

import type { CertificateInput } from '@/types/certificate';

/**
 * Validates the request body used to create a new certificate.
 *
 * Ensures that the payload is:
 *  - a JSON object
 *  - contains all required fields
 *  - contains string values with valid content
 *  - follows specific format rules (e.g., certificateId regex, date parsing)
 *
 * @param body - The unknown request payload from POST request
 * @returns An object with either valid data or an error message
 */
export function validateCertificatePayload(body: unknown): {
  valid: boolean;
  error?: string;
  data?: CertificateInput;
} {
  // Check if the incoming body is an object (not null, not primitive)
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Payload must be a JSON object' };
  }

  // Type assertion to access fields safely
  const maybe = body as Record<string, unknown>;
  const { courseTitle, completedAt, certificateId } = maybe;

  // All required fields must be strings
  if (
    typeof courseTitle !== 'string' ||
    typeof completedAt !== 'string' ||
    typeof certificateId !== 'string'
  ) {
    return { valid: false, error: 'All fields must be strings' };
  }

  // Fields must not be empty or whitespace-only
  if (!courseTitle.trim() || !completedAt.trim() || !certificateId.trim()) {
    return { valid: false, error: 'Fields cannot be empty' };
  }

  // Enforce format for certificateId: uppercase letters, numbers, and dashes only
  const certIdRegex = /^[A-Z0-9\-]+$/;
  if (!certIdRegex.test(certificateId)) {
    return { valid: false, error: 'Invalid certificateId format' };
  }

  // Validate date format using built-in parser
  const timestamp = Date.parse(completedAt);
  if (isNaN(timestamp)) {
    return { valid: false, error: 'Invalid completedAt date format' };
  }

  // All checks passed; return the cleaned and validated data
  return {
    valid: true,
    data: {
      courseTitle: courseTitle.trim(),
      completedAt,
      certificateId: certificateId.trim(),
    },
  };
}
