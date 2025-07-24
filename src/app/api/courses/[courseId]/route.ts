import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();
    const { courseId } = await params;

    // Find published course (no enrollment requirement for viewing)
    const course = await Course.findOne({
      _id: courseId,
      status: 'published',
    })
      .populate('instructor', 'name email')
      .select(
        'title description thumbnail modules price category level averageRating ratingCount createdAt'
      );

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
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
