import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import redis from '@/lib/redis';

const CACHE_TTL_SECONDS = 60;

interface ParamsContext {
  params: {
    certificateId: string;
  };
}

/**
 * Apply standard security headers to response
 */
function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

/**
 * GET /api/student/certification/[certificateId]
 * Returns a specific certificate belonging to the authenticated user.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ certificateId: string }> }
): Promise<NextResponse> {
  const { certificateId } = await context.params;
  const trimmedId = certificateId.trim();

  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

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

    await connectDB();
    const cert = await Certificate.findOne({
      certificateId: trimmedId,
      userId: userEmail,
    });

    if (!cert) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
      );
    }

    await redis.set(cacheKey, JSON.stringify(cert), 'EX', CACHE_TTL_SECONDS);

    return applySecurityHeaders(
      NextResponse.json({ certificate: cert, cached: false })
    );
  } catch (err) {
    console.error('[GET /certification/:id] Internal Error:', err);
    return applySecurityHeaders(
      NextResponse.json(
        {
          error: 'Failed to retrieve certificate',
          detail: err instanceof Error ? err.message : 'Unknown error',
        },
        { status: 500 }
      )
    );
  }
}
