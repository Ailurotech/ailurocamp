import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import StudentProgress from '@/models/StudentProgress';
import Assessment from '@/models/Assessment';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; studentId: string } }
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

  const { courseId, studentId } = params;

  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }

  if (!studentId) {
    return NextResponse.json(
      { error: 'Student ID is required' },
      { status: 400 }
    );
  }

  try {
    const course = await Course.findById(courseId).populate('modules');

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (
      !session.user?.roles?.includes('admin') &&
      course.instructor.toString() !== session.user?.id
    ) {
      return NextResponse.json(
        { error: "You do not have permission to view this student's progress" },
        { status: 403 }
      );
    }

    const student = await User.findById(studentId).select('name email');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!course.enrolledStudents.includes(student._id)) {
      return NextResponse.json(
        { error: 'This student is not enrolled in this course' },
        { status: 404 }
      );
    }

    const progress = await StudentProgress.findOne({
      course: courseId,
      student: studentId,
    });

    const assessments = await Assessment.find({
      course: courseId,
      'submissions.student': studentId,
    }).select('title type totalPoints submissions.$');

    const response = {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
      course: {
        id: course._id,
        title: course.title,
        modules: course.modules.map((module: any) => ({
          title: module.title,
          lessons: module.lessons || [],
        })),
      },
      progress: progress || {
        overallProgress: 0,
        completedModules: [],
        completedLessons: [],
        lastAccessedAt: null,
      },
      assessments: assessments.map((assessment) => ({
        id: assessment._id,
        title: assessment.title,
        type: assessment.type,
        totalPoints: assessment.totalPoints,
        submission: assessment.submissions[0] || null,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching student progress details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student progress details' },
      { status: 500 }
    );
  }
}
