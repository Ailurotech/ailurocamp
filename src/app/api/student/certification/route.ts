import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import { applyBasicRateLimit } from '@/lib/rateLimit';

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for') || 'unknown';
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  if (!applyBasicRateLimit(ip)) {
    return NextResponse.json({ message: 'Too Many Requests' }, { status: 429 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const certificates = await Certificate.find({ userId: session.user.email });
    return NextResponse.json({ certificates });
    } catch (err) {
      console.error('[GET /certification] Unexpected Error:', err);

      return NextResponse.json(
        {
          message: 'Internal server error during certificate retrieval',
          error: err instanceof Error ? err.message : 'Unknown error',
          stack: process.env.NODE_ENV !== 'production' && err instanceof Error ? err.stack : undefined,
        },
        { status: 500 }
      );
    }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const allowedOrigins = [
      'http://localhost:3000',
      process.env.NEXT_PUBLIC_BASE_URL,
    ].filter((url): url is string => typeof url === 'string');

    const origin =
      req.headers.get('origin') || req.headers.get('referer') || '';

    if (!allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
      return NextResponse.json(
        { message: 'Forbidden: CSRF validation failed' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseTitle, completedAt, certificateId } = body;

    if (
      typeof courseTitle !== 'string' ||
      typeof completedAt !== 'string' ||
      typeof certificateId !== 'string'
    ) {
      return NextResponse.json(
        { message: 'Invalid input types' },
        { status: 400 }
      );
    }

    const certIdRegex = /^[A-Z0-9\-]+$/;
    if (!certIdRegex.test(certificateId)) {
      return NextResponse.json(
        { message: 'Invalid certificateId format' },
        { status: 400 }
      );
    }

    await connectDB();

    const cert = await Certificate.create({
      userId: session.user.email,
      courseTitle: courseTitle.trim(),
      completedAt: new Date(completedAt),
      certificateId: certificateId.trim(),
    });

    return NextResponse.json({ message: 'Certificate saved', cert });
  } catch (err) {
    console.error('[POST /certification] Error:', err);
    return NextResponse.json(
      {
        message: 'Internal server error during certificate creation',
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: process.env.NODE_ENV !== 'production' && err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
