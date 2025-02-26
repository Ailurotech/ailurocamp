import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import type { ICourse } from '@/types/course';

// Get all courses
export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const courses: ICourse[] = await Course.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ courses });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to fetch courses', message: (error as Error).message },
      { status: 500 }
    );
  }
}
