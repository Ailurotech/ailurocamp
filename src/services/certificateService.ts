// src/services/certificateService.ts
import axios from 'axios';

export interface Certificate {
  courseTitle: string;
  completedAt: string;
  certificateId: string;
}

export async function fetchCertificates(): Promise<Certificate[]> {
  const res = await axios.get('/api/student/certification', {
    withCredentials: true,
  });
  return res.data.certificates || [];
}