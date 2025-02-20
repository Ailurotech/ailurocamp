import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({}).sort({ createdAt: -1 });
    // throw new Error('Error fetching courses');
    return NextResponse.json({ courses });
  } catch (error: unknown) {
    // console.error('Error fetching courses:', error);
    // console.log("error", error);
    return NextResponse.json({ error: 'Failed to fetch courses', message: (error as Error).message }, { status: 500 });
  }
}