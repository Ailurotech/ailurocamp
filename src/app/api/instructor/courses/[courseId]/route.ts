import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import CourseModel from '@/models/Course';
import connectDB from '@/lib/mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string } }
): Promise<NextResponse> {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { maxEnrollments } = await request.json();

    const course = await CourseModel.findOne({
      _id: params.courseId,
      instructor: userId,
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      params.courseId,
      { maxEnrollments },
      { new: true }
    );

    return NextResponse.json({
      message: 'Enrollment limit updated',
      data: updatedCourse,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
