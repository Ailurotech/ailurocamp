'use client';

import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import { fetchCertificates, Certificate } from '@/services/certificateService';
import CertificateCard from '@/components/CertificateCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Link from 'next/link';

export default function StudentCertificationPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchCertificates()
      .then(setCertificates)
      .catch((err) => {
        console.error('❌ Failed to fetch certificates:', err);
        alert('Failed to load your certificates. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadCertificate = (cert: Certificate) => {
    const blob = new Blob([JSON.stringify(cert, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `${cert.courseTitle}-certificate.json`);
  };

  const printCertificate = (cert: Certificate) => {
    const content = `
      <h1 style="font-family:sans-serif;">Certificate of Completion</h1>
      <p><strong>Course:</strong> ${cert.courseTitle}</p>
      <p><strong>Completed on:</strong> ${cert.completedAt}</p>
      <p><strong>ID:</strong> ${cert.certificateId}</p>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(content);
      win.print();
      win.close();
    }
  };

  const shareToLinkedIn = (cert: Certificate) => {
    const summary = encodeURIComponent(
      `I completed "${cert.courseTitle}" on AiluroCamp! 🎓`
    );
    const certLink = `${baseUrl}/student/certification/${cert.certificateId}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${certLink}&summary=${summary}`;
    window.open(url, '_blank');
  };

  const copyToResume = (cert: Certificate) => {
    const markdown = `**Course Completed:** ${cert.courseTitle}\n**Date:** ${cert.completedAt.slice(
      0,
      10
    )}\n**Certificate ID:** ${cert.certificateId}\n[🔗 View Certificate](${baseUrl}/student/certification/${cert.certificateId})`;
    navigator.clipboard.writeText(markdown).then(() => {
      alert('✅ Certificate info copied to clipboard!');
    });
  };

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
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">🎓 My Achievements</h1>
          <p className="text-gray-600 mb-10">
            Here you’ll find all the certificates you’ve earned through AiluroCamp courses.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.certificateId}
                cert={cert}
                baseUrl={baseUrl}
                onDownload={downloadCertificate}
                onPrint={printCertificate}
                onShare={shareToLinkedIn}
                onCopy={copyToResume}
              />
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}