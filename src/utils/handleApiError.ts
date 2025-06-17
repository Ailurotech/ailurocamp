// src/utils/handleApiError.ts
import axios from 'axios';

/**
 * Extracts a clean error message from an Axios error or unknown error.
 *
 * @param error - The error object caught in a .catch block
 * @returns A human-readable message for UI display
 */
export function extractApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message
    );
  }

  return 'An unexpected error occurred. Please try again.';
}
