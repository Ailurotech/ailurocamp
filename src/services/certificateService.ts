// src/services/certificateService.ts
import axios from 'axios';
import type { Certificate } from '@/types/certificate';
import { extractApiErrorMessage } from '@/utils/handleApiError';

/**
 * Fetches all certificates associated with the logged-in user.
 *
 * @returns Promise that resolves to a list of certificates.
 * @throws Error with readable message if the API call fails.
 */
export async function fetchCertificates(): Promise<Certificate[]> {
  try {
    const res = await axios.get('/api/student/certification', {
      withCredentials: true,
    });
    return res.data.certificates || [];
  } catch (err) {
    console.error('❌ Failed to fetch certificates:', err);
    throw new Error(extractApiErrorMessage(err));
  }
}
