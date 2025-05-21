import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import redis from '@/lib/redis';

const CACHE_TTL_SECONDS = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(_req: NextRequest, context: any) {
  const certificateId = context?.params?.certificateId?.trim();

  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = `certificate:${userEmail}:${certificateId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        certificate: JSON.parse(cached),
        cached: true,
      });
    }

    await connectDB();
    const cert = await Certificate.findOne({
      certificateId,
      userId: userEmail,
    });

    if (!cert) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    await redis.set(cacheKey, JSON.stringify(cert), 'EX', CACHE_TTL_SECONDS);

    return NextResponse.json({ certificate: cert, cached: false });
  } catch (err) {
    console.error('[GET /certification/:id] Internal Error:', err);
    return NextResponse.json(
      {
        error: 'Failed to retrieve certificate',
        detail: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
