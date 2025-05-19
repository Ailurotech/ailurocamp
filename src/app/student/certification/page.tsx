'use client';

import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import axios from 'axios';

/**
 * TypeScript interface representing a certificate document
 */

interface Certificate {
  courseTitle: string;
  completedAt: string;
  certificateId: string;
}

/**
 * StudentCertificationPage component
 *
 * Displays a list of certificates earned by the logged-in user.
 * Provides actions for downloading, printing, and sharing each certificate.
 */

export default function StudentCertificationPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Base URL for certificate sharing and verification
   */
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  /**
   * Fetch certificates for the logged-in user from the API
   */
  useEffect(() => {
    axios
      .get('/api/student/certification', {
        withCredentials: true,
      })
      .then((res) => {
        setCertificates(res.data.certificates || []);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch certificates:', err);
        alert('Failed to load your certificates. Please try again later or check the console for more info.');
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Download the certificate as a JSON file
   * @param cert - The certificate to download
   */
  const downloadCertificate = (cert: Certificate) => {
    const blob = new Blob([JSON.stringify(cert, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `${cert.courseTitle}-certificate.json`);
  };

  /**
   * Print the certificate in a new browser window
   * @param cert - The certificate to print
   */
  const printCertificate = (cert: Certificate) => {
    const content = `
      <h1 style="font-family:sans-serif;">Certificate of Completion</h1>
      <p><strong>Course:</strong> ${cert.courseTitle}</p>
      <p><strong>Completed on:</strong> ${cert.completedAt}</p>
      <p><strong>ID:</strong> ${cert.certificateId}</p>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(content);
      win.print();
      win.close();
    }
  };

  /**
   * Share the certificate link on LinkedIn
   * @param cert - The certificate to share
   */
  const shareToLinkedIn = (cert: Certificate) => {
    const summary = encodeURIComponent(
      `I completed "${cert.courseTitle}" on AiluroCamp! 🎓`
    );
    const certLink = `${baseUrl}/student/certification/${cert.certificateId}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${certLink}&summary=${summary}`;
    window.open(url, '_blank');
  };

  if (loading) return <p className="p-4">Loading certificates...</p>;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-800 mb-2">
          🎓 My Achievements
        </h1>
        <p className="text-gray-600 mb-10">
          Here you’ll find all the certificates you’ve earned through AiluroCamp
          courses.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.certificateId}
              className="bg-white shadow-md border border-gray-200 rounded-lg p-6 flex flex-col justify-between"
            >
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
                  onClick={() => downloadCertificate(cert)}
                  className="bg-indigo-600 text-white text-sm py-1.5 px-3 rounded hover:bg-indigo-700"
                >
                  📥 Download
                </button>
                <button
                  onClick={() => shareToLinkedIn(cert)}
                  className="bg-blue-600 text-white text-sm py-1.5 px-3 rounded hover:bg-blue-700"
                >
                  🔗 Share
                </button>
                <button
                  onClick={() => printCertificate(cert)}
                  className="col-span-2 bg-gray-100 text-gray-800 text-sm py-1.5 px-3 rounded hover:bg-gray-200"
                >
                  🖨 Print Certificate
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
          ))}
        </div>
      </div>
    </div>
  );
}
