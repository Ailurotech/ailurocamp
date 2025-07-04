'use client';

import type { Certificate } from '@/types/certificate';
import Link from 'next/link';

interface Props {
  certificate: Certificate;
}

/**
 * CertificateDetail Component
 *
 * Displays a visually focused view of a single certificate with essential metadata.
 * This is used on the certificate detail page when a user clicks into a specific certificate.
 *
 * Props:
 * - certificate: The certificate data to render (title, date, ID)
 */
export default function CertificateDetail({ certificate }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12 text-center">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">
        🎉 Certificate of Completion
      </h1>

      {/* Introductory message */}
      <p className="text-lg text-gray-700">
        This certifies that you’ve completed:
      </p>

      {/* Course title */}
      <h2 className="text-2xl font-semibold text-gray-900 mt-4">
        {certificate.courseTitle}
      </h2>

      {/* Completion date */}
      <p className="text-gray-600 mt-2">
        Completed on: {certificate.completedAt.slice(0, 10)}
      </p>

      {/* Certificate ID */}
      <p className="text-sm text-gray-400 mt-1">
        Certificate ID: {certificate.certificateId}
      </p>

      {/* Back to certificate list */}
      <div className="mt-8">
        <Link
          href="/student/certification"
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          ← Back to My Certificates
        </Link>
      </div>
    </div>
  );
}
