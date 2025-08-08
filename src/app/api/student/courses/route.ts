import { getServerSession } from 'next-auth';
import Course from '@/models/Course';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  try {
    const courses = await Course.find({
      enrolledStudents: new mongoose.Types.ObjectId(session.user.id),
    });
    return NextResponse.json({ courses });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error fetching courses', error: (error as Error).message },
      { status: 500 }
    );
  }
}
