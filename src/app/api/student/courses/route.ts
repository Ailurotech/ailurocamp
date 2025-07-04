import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find courses where the student is enrolled
    const enrolledCourses = await Course.find({
      enrolledStudents: session.user.id,
      status: 'published'
    })
    .populate('instructor', 'name email')
    .select('title description thumbnail modules price category level averageRating createdAt')
    .sort({ createdAt: -1 });

    return NextResponse.json({ courses: enrolledCourses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}