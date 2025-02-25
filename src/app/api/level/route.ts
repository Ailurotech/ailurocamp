// Fetch all levels
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseLevel from '@/models/CourseLevel';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const levels: { name: string }[] = await CourseLevel.find({});
    return NextResponse.json({ levels });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error fetching levels', error: (error as Error).message },
      { status: 500 }
    );
  }
}