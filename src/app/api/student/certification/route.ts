import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import redis from '@/lib/redis';
import { applyRedisRateLimit } from '@/lib/rateLimit';

const CACHE_TTL_SECONDS = 60;

/**
 * Apply standard security headers to the response
 */
function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

/**
 * Extract client IP address from the request headers
 */
function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for') || 'unknown';
}

/**
 * CSRF protection: check if the request origin is allowed
 */
function passesCsrfCheck(origin: string | null): boolean {
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_BASE_URL,
  ].filter(Boolean) as string[];

  return allowedOrigins.some((allowed) => origin?.startsWith(allowed));
}

/**
 * GET /api/student/certification
 * Fetches all certificates for the authenticated user (with Redis cache and rate limit)
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await applyRedisRateLimit(ip);
  if (!allowed) {
    return applySecurityHeaders(
      NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const cacheKey = `certificates:${userEmail}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return applySecurityHeaders(
        NextResponse.json({ certificates: JSON.parse(cached), cached: true })
      );
    }

    await connectDB();
    const certificates = await Certificate.find({ userId: userEmail });

    await redis.set(
      cacheKey,
      JSON.stringify(certificates),
      'EX',
      CACHE_TTL_SECONDS
    );

    return applySecurityHeaders(
      NextResponse.json({ certificates, cached: false })
    );
  } catch (err) {
    console.error('[GET /certification] Internal Error:', err);
    return applySecurityHeaders(
      NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    );
  }
}

/**
 * POST /api/student/certification
 * Creates a new certificate for the authenticated user (with CSRF and input validation)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const origin = req.headers.get('origin') || req.headers.get('referer');
    if (!passesCsrfCheck(origin)) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
      );
    }

    const body = await req.json();
    const { courseTitle, completedAt, certificateId } = body;

    if (
      typeof courseTitle !== 'string' ||
      typeof completedAt !== 'string' ||
      typeof certificateId !== 'string'
    ) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Invalid input format' }, { status: 400 })
      );
    }

    const certIdRegex = /^[A-Z0-9\-]+$/;
    if (!certIdRegex.test(certificateId)) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Invalid certificateId format' },
          { status: 400 }
        )
      );
    }

    await connectDB();
    const cert = await Certificate.create({
      userId: userEmail,
      courseTitle: courseTitle.trim(),
      completedAt: new Date(completedAt),
      certificateId: certificateId.trim(),
    });

    await redis.del(`certificates:${userEmail}`);

    return applySecurityHeaders(
      NextResponse.json({ message: 'Certificate created', cert })
    );
  } catch (err) {
    console.error('[POST /certification] Internal Error:', err);
    return applySecurityHeaders(
      NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    );
  }
}
