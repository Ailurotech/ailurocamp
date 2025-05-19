'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import axiosRetry from 'axios-retry';

interface Certificate {
  courseTitle: string;
  completedAt: string;
  certificateId: string;
}

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000, // 1s, 2s, 3s
  retryCondition: (error) => axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error),
});

export default function CertificateDetailPage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const id =
      typeof certificateId === 'string' ? certificateId.replace(/\/$/, '') : '';

    axios
      .get(`/api/student/certification/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data?.certificate) {
          setCertificate(res.data.certificate);
          setErrorMsg(null);
        } else {
          setCertificate(null);
          setErrorMsg('Certificate not found.');
        }
      })
      .catch((err) => {
        console.error('Error fetching certificate:', err);
        setErrorMsg('Failed to load certificate. Please try again later.');
        setCertificate(null);
      })
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading certificate...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-2">Oops</h1>
        <p className="text-gray-600 text-lg">{errorMsg}</p>
        <p className="mt-4 text-sm text-gray-400">
          Please check the certificate link or go back to the certification page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12 text-center">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">
        🎉 Certificate of Completion
      </h1>
      <p className="text-lg text-gray-700">
        This certifies that you’ve completed:
      </p>
      <h2 className="text-2xl font-semibold text-gray-900 mt-4">
        {certificate.courseTitle}
      </h2>
      <p className="text-gray-600 mt-2">
        Completed on: {certificate.completedAt.slice(0, 10)}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Certificate ID: {certificate.certificateId}
      </p>
      <div className="mt-8">
        <a
          href="/student/certification"
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          ← Back to My Certificates
        </a>
      </div>
    </div>
  );
}