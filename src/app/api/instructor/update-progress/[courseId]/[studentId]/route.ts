import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import StudentProgress from '@/models/StudentProgress';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !session.user.roles?.includes('instructor')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params since it's now a Promise in Next.js 13.4+
    const resolvedParams = await params;

    // Extract courseId and studentId from the resolved parameters
    const courseId = resolvedParams.courseId;
    const studentId = resolvedParams.studentId;

    const { overallProgress } = await request.json();

    if (
      typeof overallProgress !== 'number' ||
      overallProgress < 0 ||
      overallProgress > 100
    ) {
      return NextResponse.json(
        { error: 'Invalid progress value' },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await StudentProgress.updateOne(
      {
        course: new ObjectId(courseId),
        student: new ObjectId(studentId),
      },
      {
        $set: {
          overallProgress: overallProgress,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Student progress record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Progress updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating student progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
