import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';

export async function POST(req: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const { reviewId, reason } = await req.json();
    if (!reviewId || !reason) {
      return NextResponse.json(
        { message: 'Missing reviewId or reason.' },
        { status: 400 }
      );
    }
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { message: 'Review not found.' },
        { status: 404 }
      );
    }
    review.reports = review.reports || [];
    review.reports.push({ userId: session.user.id, reason, date: new Date() });
    await review.save();
    return NextResponse.json(
      { message: 'Review reported.', review },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error reporting review.', error: (error as Error).message },
      { status: 500 }
    );
  }
}
