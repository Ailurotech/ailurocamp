import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import StudentProgress from '@/models/StudentProgress';

// API route for fetching the progress of students in a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
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

  // Extract courseId from the URL parameters
  const { courseId } = params;

  // Check if the courseId is provided
  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch the course using the courseId
    const course = await Course.findById(courseId);

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
        {
          error: 'You do not have permission to view progress for this course',
        },
        { status: 403 }
      );
    }

    // Fetch all the progress data for students enrolled in the course
    const progressData = await StudentProgress.find({
      course: courseId,
    }).populate('student', 'name email'); // Populate student info (name, email)

    // Fetch the students enrolled in the course
    const enrolledStudents = await User.find({
      _id: { $in: course.enrolledStudents }, // Match student IDs in enrolledStudents array
      roles: 'student', // Ensure the user is a student
    }).select('_id name email'); // Select only the necessary fields (ID, name, email)

    // Find students who are enrolled in the course but don't have progress data
    // This identifies students who haven't started the course yet
    const studentIds = progressData.map((p) => p.student._id.toString());
    const studentsWithoutProgress = enrolledStudents.filter(
      (student) => !studentIds.includes(student._id.toString())
    );

    // Prepare the response data with comprehensive course progress information
    const response = {
      course: {
        id: course._id,
        title: course.title,
      },
      studentsProgress: progressData, // Include the progress data for each student
      studentsWithoutProgress, // Include students who do not have progress data
      totalStudents: course.enrolledStudents.length, // Total number of enrolled students
      totalWithProgress: progressData.length, // Number of students with progress data
    };

    // Return the response as JSON
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    // If an error occurs, return a 500 error
    return NextResponse.json(
      { error: 'Failed to fetch student progress data' },
      { status: 500 }
    );
  }
}
