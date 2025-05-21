'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import CertificateCard from '@/components/CertificateCard';
import { fetchCertificates } from '@/services/certificateService';
import {
  downloadCertificate,
  printCertificate,
  shareToLinkedIn,
  copyToResume,
} from '@/utils/certificateActions';
import { extractApiErrorMessage } from '@/utils/handleApiError';
import type { Certificate } from '@/types/certificate';

export default function StudentCertificationPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchCertificates()
      .then(setCertificates)
      .catch((err) => {
        console.error('❌ Failed to fetch certificates:', err);
        alert(extractApiErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading certificates...</p>;

  return (
    <ErrorBoundary>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <Link
              href="/dashboard"
              className="inline-block text-indigo-600 hover:underline text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-indigo-800 mb-2">
            🎓 My Achievements
          </h1>
          <p className="text-gray-600 mb-10">
            Here you’ll find all the certificates you’ve earned through
            AiluroCamp courses.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.certificateId}
                cert={cert}
                baseUrl={baseUrl}
                onDownload={() => downloadCertificate(cert)}
                onPrint={() => printCertificate(cert)}
                onShare={() => shareToLinkedIn(cert, baseUrl)}
                onCopy={() => copyToResume(cert, baseUrl)}
              />
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
