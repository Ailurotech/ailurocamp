import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import SessionDebugger from '@/components/SessionDebugger';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AiluroCamp - Learning Management System',
  description: 'A modern learning management system for online education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <SessionDebugger />
        </Providers>
      </body>
    </html>
  );
}
