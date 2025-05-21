// src/app/api/student/certification/[certificateId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import Certificate from '@/models/Certificate';
import {
  applySecurityHeaders,
  getUserEmail,
  safeConnectDB,
} from '@/lib/apiUtils';

const CACHE_TTL_SECONDS = 60;

/**
 * Creates a standardized error response wrapped with secure headers.
 * Also logs the error to the console if detailed info is available.
 *
 * @param message - A user-facing error message
 * @param status - HTTP status code to return
 * @param detail - Optional internal error detail for logging
 * @returns Formatted NextResponse with security headers
 */
function createErrorResponse(
  message: string,
  status: number,
  detail?: unknown
): NextResponse {
  if (detail) console.error(`[Error ${status}] ${message}:`, detail);
  return applySecurityHeaders(
    NextResponse.json({ error: message }, { status })
  );
}

/**
 * GET /api/student/certification/[certificateId]
 *
 * Retrieves a specific certificate for the currently authenticated user.
 * - Validates user session
 * - Checks Redis cache for fast path
 * - Falls back to MongoDB query if not cached
 * - Stores the result in Redis for future reuse
 *
 * This handler includes:
 * - Caching layer with Redis (keyed by user + certificateId)
 * - Security headers for XSS/hardening
 * - Graceful error fallback with meaningful messages
 *
 * @param _req - Incoming Next.js request object (unused here)
 * @param context - Route parameters containing the certificate ID
 * @returns JSON response with certificate object or error
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ certificateId: string }> }
): Promise<NextResponse> {
  try {
    // Extract dynamic route parameter: certificateId
    const { certificateId } = await context.params;
    const trimmedId = certificateId.trim();

    // Validate and retrieve authenticated user email
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Attempt Redis cache lookup for faster response
    const cacheKey = `certificate:${userEmail}:${trimmedId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return applySecurityHeaders(
        NextResponse.json({
          certificate: JSON.parse(cached),
          cached: true,
        })
      );
    }

    // No cache hit — fallback to DB query
    await safeConnectDB();
    const cert = await Certificate.findOne({
      certificateId: trimmedId,
      userId: userEmail,
    });

    if (!cert) {
      return createErrorResponse('Certificate not found', 404);
    }

    // Cache the result for future lookups
    await redis.set(cacheKey, JSON.stringify(cert), 'EX', CACHE_TTL_SECONDS);

    return applySecurityHeaders(
      NextResponse.json({ certificate: cert, cached: false })
    );
  } catch (err) {
    return createErrorResponse('Failed to retrieve certificate', 500, err);
  }
}
