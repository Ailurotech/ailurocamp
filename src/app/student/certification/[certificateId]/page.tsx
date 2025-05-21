'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import CertificateDetail from '@/components/CertificateDetail';
import { extractApiErrorMessage } from '@/utils/handleApiError';
import type { Certificate } from '@/types/certificate';

// Enable automatic retry on network errors
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error),
});

/**
 * CertificateDetailPage
 *
 * Fetches and displays details for a single certificate using the `CertificateDetail` component.
 */
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
        console.error('❌ Certificate fetch failed:', err);
        setErrorMsg(extractApiErrorMessage(err));
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

  return (
    <ErrorBoundary>
      {!certificate ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-2">Oops</h1>
          <p className="text-gray-600 text-lg">{errorMsg}</p>
          <p className="mt-4 text-sm text-gray-400">
            Please check the certificate link or go back to the certification
            page.
          </p>
        </div>
      ) : (
        <CertificateDetail certificate={certificate} />
      )}
    </ErrorBoundary>
  );
}
