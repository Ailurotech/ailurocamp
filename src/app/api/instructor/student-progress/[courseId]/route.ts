import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import StudentProgress from '@/models/StudentProgress';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'You must be logged in.' },
      { status: 401 }
    );
  }

  if (
    !session.user?.roles?.includes('instructor') &&
    !session.user?.roles?.includes('admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions.' },
      { status: 403 }
    );
  }

  await connectDB();

  const { courseId } = params;

  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (
      !session.user?.roles?.includes('admin') &&
      course.instructor.toString() !== session.user?.id
    ) {
      return NextResponse.json(
        {
          error: 'You do not have permission to view progress for this course',
        },
        { status: 403 }
      );
    }

    const progressData = await StudentProgress.find({
      course: courseId,
    }).populate('student', 'name email');

    const enrolledStudents = await User.find({
      _id: { $in: course.enrolledStudents },
      roles: 'student',
    }).select('_id name email');

    const studentIds = progressData.map((p) => p.student._id.toString());
    const studentsWithoutProgress = enrolledStudents.filter(
      (student) => !studentIds.includes(student._id.toString())
    );

    const response = {
      course: {
        id: course._id,
        title: course.title,
      },
      studentsProgress: progressData,
      studentsWithoutProgress,
      totalStudents: course.enrolledStudents.length,
      totalWithProgress: progressData.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student progress data' },
      { status: 500 }
    );
  }
}
