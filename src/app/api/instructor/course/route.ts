import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import type { ICourse } from '@/types/course';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Get all courses by instructor ID
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user || session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the instructor ID from the search parameters
    const searchParams: URLSearchParams = req.nextUrl.searchParams;
    const instructorId: string | null = searchParams.get('instructorId');
    const page: number = parseInt(searchParams.get('page') || '1', 10);
    const limit: number = 10;
    const skip: number = (page - 1) * limit;

    // Fetch the courses by instructor ID
    await connectDB();
    const courses: ICourse[] = await Course.find({ instructor: instructorId })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    // Get the total count of courses for pagination controls
    const totalCourses = await Course.countDocuments({
      instructor: instructorId,
    });
    return NextResponse.json({ courses, totalCourses, page, limit });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to fetch courses', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Update a course by course ID
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user || session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams: URLSearchParams = req.nextUrl.searchParams;
    const courseId: string | null = searchParams.get('courseId');
    await connectDB();
    const updatedContent: ICourse = await req.json();

    // Check if the course exists
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if the course belongs to the instructor    
    if (course.instructor.toString() !== session.user.id) {
      return NextResponse.json({ error: 'The course does not belong to you, you cannot update it.' }, { status: 401 });
    }

    const updatedResult: ICourse | null = await Course.findByIdAndUpdate(
      courseId,
      updatedContent,
      {
        new: true,
      }
    );
    return NextResponse.json({ updatedResult });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Error updating course', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Delete a course by course ID
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user || session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams: URLSearchParams = req.nextUrl.searchParams;
    const courseId: string | null = searchParams.get('courseId');
    await connectDB();

    // Check if the course belongs to the instructor
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    if (course.instructor.toString() !== session.user.id) {
      return NextResponse.json({ error: 'The course does not belong to you, you cannot delete it.' }, { status: 401 });
    }

    const deletedResult: ICourse | null =
      await Course.findByIdAndDelete(courseId);
    return NextResponse.json({ deletedResult });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Error deleting course', message: (error as Error).message },
      { status: 500 }
    );
  }
}
