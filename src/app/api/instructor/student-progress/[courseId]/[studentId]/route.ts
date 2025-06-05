import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import StudentProgress from '@/models/StudentProgress';
import Assessment from '@/models/Assessment';

// Define the CourseModule interface
interface CourseModule {
  title: string;
  lessons?: unknown[];
}

// API route for fetching the progress of a student in a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; studentId: string }> }
) {
  // Retrieve the current session using NextAuth
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json(
      { error: 'You must be logged in.' },
      { status: 401 }
    );
  }

  // Ensure the user has sufficient permissions (either instructor or admin)
  if (
    !session.user?.roles?.includes('instructor') &&
    !session.user?.roles?.includes('admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions.' },
      { status: 403 }
    );
  }

  // Connect to the MongoDB database
  await connectDB();

  // Await the params since it's now a Promise in Next.js 13.4+
  const resolvedParams = await params;

  // Extract courseId and studentId from the resolved parameters
  const courseId = resolvedParams.courseId;
  const studentId = resolvedParams.studentId;

  // Check if the courseId is provided
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }

  // Check if the studentId is provided
  if (!studentId) {
    return NextResponse.json(
      { error: 'Student ID is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch the course using the courseId and populate its modules
    const course = await Course.findById(courseId).populate('modules');

    // If the course is not found, return an error
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Ensure the instructor is either an admin or the course instructor
    if (
      !session.user?.roles?.includes('admin') &&
      course.instructor.toString() !== session.user?.id
    ) {
      return NextResponse.json(
        { error: "You do not have permission to view this student's progress" },
        { status: 403 }
      );
    }

    // Fetch the student by their ID and select name and email
    const student = await User.findById(studentId).select('name email');

    // If the student is not found, return an error
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Ensure the student is enrolled in the course
    if (!course.enrolledStudents.includes(student._id)) {
      return NextResponse.json(
        { error: 'This student is not enrolled in this course' },
        { status: 404 }
      );
    }

    // Fetch the student's progress for the given course
    const progress = await StudentProgress.findOne({
      course: courseId,
      student: studentId,
    });

    // Fetch the student's assessment submissions for the given course
    const assessments = await Assessment.find({
      course: courseId,
      'submissions.student': studentId,
    }).select('title type totalPoints submissions.$');

    // Prepare the response with the student's details, course, progress, and assessments
    const response = {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
      course: {
        id: course._id,
        title: course.title,
        modules: course.modules.map((courseModule: CourseModule) => ({
          title: courseModule.title,
          lessons: courseModule.lessons || [], // Ensure modules have lessons
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
        submission: assessment.submissions[0] || null, // Return the first submission
      })),
    };

    // Return the response in JSON format
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching student progress details:', error);
    // If an error occurs, return a 500 error
    return NextResponse.json(
      { error: 'Failed to fetch student progress details' },
      { status: 500 }
    );
  }
}
