import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import { applyRedisRateLimit } from '@/lib/rateLimit';
import redis from '@/lib/redis';

const CACHE_TTL_SECONDS = 60;

/**
 * Extracts client IP address from headers.
 */
function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for') || 'unknown';
}

/**
 * GET /api/student/certification
 * Fetch all certificates belonging to the logged-in user with Redis caching.
 */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const allowed = await applyRedisRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = `certificates:${userEmail}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        certificates: JSON.parse(cached),
        cached: true,
      });
    }

    await connectDB();
    const certificates = await Certificate.find({ userId: userEmail });

    await redis.set(cacheKey, JSON.stringify(certificates), 'EX', CACHE_TTL_SECONDS);

    return NextResponse.json({ certificates, cached: false });
  } catch (err) {
    console.error('[GET /certification] Internal Error:', err);
    return NextResponse.json(
      {
        error: 'Failed to retrieve certificates',
        detail: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/certification
 * Create a new certificate for the authenticated user.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // CSRF protection via Origin check
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.NEXT_PUBLIC_BASE_URL,
    ].filter(Boolean) as string[];

    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    if (!allowedOrigins.some(o => origin.startsWith(o))) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
    }

    const body = await req.json();
    const { courseTitle, completedAt, certificateId } = body;

    if (
      typeof courseTitle !== 'string' ||
      typeof completedAt !== 'string' ||
      typeof certificateId !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
    }

    const certIdRegex = /^[A-Z0-9\-]+$/;
    if (!certIdRegex.test(certificateId)) {
      return NextResponse.json({ error: 'Invalid certificateId format' }, { status: 400 });
    }

    await connectDB();
    const cert = await Certificate.create({
      userId: userEmail,
      courseTitle: courseTitle.trim(),
      completedAt: new Date(completedAt),
      certificateId: certificateId.trim(),
    });

    // 🔥 Clear cache after writing
    await redis.del(`certificates:${userEmail}`);

    return NextResponse.json({ message: 'Certificate created', cert });
  } catch (err) {
    console.error('[POST /certification] Internal Error:', err);
    return NextResponse.json(
      {
        error: 'Failed to create certificate',
        detail: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}