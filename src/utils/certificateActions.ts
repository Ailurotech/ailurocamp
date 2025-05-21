// src/utils/certificateActions.ts

import { saveAs } from 'file-saver';
import { Certificate } from '@/types/certificate';

/**
 * Download certificate as JSON file.
 */
export function downloadCertificate(cert: Certificate): void {
  const blob = new Blob([JSON.stringify(cert, null, 2)], {
    type: 'application/json',
  });
  saveAs(blob, `${cert.courseTitle}-certificate.json`);
}

/**
 * Print certificate in a new window.
 */
export function printCertificate(cert: Certificate): void {
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
}

/**
 * Share certificate to LinkedIn.
 */
export function shareToLinkedIn(cert: Certificate, baseUrl: string): void {
  const summary = encodeURIComponent(
    `I completed "${cert.courseTitle}" on AiluroCamp! 🎓`
  );
  const certLink = `${baseUrl}/student/certification/${cert.certificateId}`;
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${certLink}&summary=${summary}`;
  window.open(url, '_blank');
}

/**
 * Copy certificate to resume in Markdown format.
 */
export function copyToResume(cert: Certificate, baseUrl: string): void {
  const markdown = `**Course Completed:** ${cert.courseTitle}\n**Date:** ${cert.completedAt.slice(
    0,
    10
  )}\n**Certificate ID:** ${cert.certificateId}\n[🔗 View Certificate](${baseUrl}/student/certification/${cert.certificateId})`;

  navigator.clipboard.writeText(markdown).then(() => {
    alert('✅ Certificate info copied to clipboard!');
  });
}
