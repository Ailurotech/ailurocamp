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
    console.error(err);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!applyBasicRateLimit(ip)) {
    return NextResponse.json({ message: 'Too Many Requests' }, { status: 429 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseTitle, completedAt, certificateId } = body;

    if (!courseTitle || !completedAt || !certificateId) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await connectDB();

    const cert = await Certificate.create({
      userId: session.user.email,
      courseTitle,
      completedAt,
      certificateId,
    });

    return NextResponse.json({ message: 'Certificate saved', cert });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
