'use client';

import type { Certificate } from '@/types/certificate';

interface Props {
  cert: Certificate;
  baseUrl: string;
  onDownload(cert: Certificate): void;
  onPrint(cert: Certificate): void;
  onShare(cert: Certificate): void;
  onCopy(cert: Certificate): void;
}

export default function CertificateCard({
  cert,
  baseUrl,
  onDownload,
  onPrint,
  onShare,
  onCopy,
}: Props) {
  return (
    <div className="bg-white shadow-md border border-gray-200 rounded-lg p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {cert.courseTitle}
        </h2>
        <p className="text-sm text-gray-500 mb-1">
          Completed on:{' '}
          <span className="text-gray-700 font-medium">
            {cert.completedAt.slice(0, 10)}
          </span>
        </p>
        <p className="text-xs text-gray-400">
          Certificate ID: {cert.certificateId}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => onDownload(cert)}
          className="bg-indigo-600 text-white text-sm py-1.5 px-3 rounded hover:bg-indigo-700"
        >
          📥 Download
        </button>
        <button
          onClick={() => onShare(cert)}
          className="bg-blue-600 text-white text-sm py-1.5 px-3 rounded hover:bg-blue-700"
        >
          🔗 Share
        </button>
        <button
          onClick={() => onPrint(cert)}
          className="bg-gray-100 text-gray-800 text-sm py-1.5 px-3 rounded hover:bg-gray-200"
        >
          🖨 Print
        </button>
        <button
          onClick={() => onCopy(cert)}
          className="bg-gray-200 text-gray-800 text-sm py-1.5 px-3 rounded hover:bg-gray-300"
        >
          📋 Copy
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <div>
          ✅{' '}
          <span className="text-gray-600">
            Certificate added to your profile
          </span>
        </div>
        <div>
          🔍 <span className="text-gray-600">Verifiable at:</span>{' '}
          <a
            className="text-indigo-600 underline"
            href={`${baseUrl}/student/certification/${cert.certificateId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {baseUrl}/student/certification/{cert.certificateId}
          </a>
        </div>
      </div>
    </div>
  );
}
