// src/lib/apiUtils.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

/**
 * Applies a common set of HTTP response headers to enhance security.
 *
 * These headers help:
 * - Prevent MIME-type sniffing (X-Content-Type-Options)
 * - Disallow rendering in iframes from other origins (X-Frame-Options)
 * - Control referrer information sent with requests (Referrer-Policy)
 *
 * @param res - The response object to enhance
 * @returns Modified NextResponse with security headers
 */
export function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

/**
 * Retrieves the currently authenticated user's email address from the session.
 *
 * Uses NextAuth's `getServerSession()` to extract session info from cookies.
 * If the session is invalid or missing, returns `null`.
 *
 * @returns Authenticated user's email string, or null if not found
 */
export async function getUserEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email || null;
}

/**
 * Connects to MongoDB safely, with error handling.
 *
 * Ensures the database connection is established before making queries.
 * If connection fails, logs error and throws a consistent application error.
 *
 * This function is designed to be reusable across API routes.
 *
 * @throws Will throw an error if the MongoDB connection fails
 */
export async function safeConnectDB(): Promise<void> {
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ DB Connection Error:', err);
    throw new Error('Database connection failed');
  }
}
