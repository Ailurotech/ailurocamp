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
    if (!session?.user) {
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
