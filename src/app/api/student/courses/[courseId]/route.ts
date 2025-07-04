import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { courseId } = await params;
    
    // Find course and verify student is enrolled
    const course = await Course.findOne({
      _id: courseId,
      enrolledStudents: session.user.id,
      status: 'published'
    })
    .populate('instructor', 'name email')
    .select('title description thumbnail modules price category level averageRating createdAt');

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}