import { NextRequest, NextResponse } from 'next/server';
import {
  AssignmentApiRequest,
  AssignmentApiResponse,
  AssignmentListResponse,
} from '@/types/assignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const { searchParams } = new URL(req.url);
    const instructorId = searchParams.get('instructorId');
    const userId = searchParams.get('userId');
    const includeAllCourses = searchParams.get('includeAllCourses') === 'true';
    await connectDB();

    let assessmentQuery: {
      type: string;
      course?: string | { $in: string[] };
    } = { type: 'assignment' };
    if (includeAllCourses) {
      if (instructorId) {
        const instructorCourses = await Course.find({
          instructor: instructorId,
        }).select('_id');
        const courseIds = instructorCourses.map((course) => course._id);
        assessmentQuery = { ...assessmentQuery, course: { $in: courseIds } };
      } else if (userId) {
        const userCourses = await Course.find({
          enrolledStudents: userId,
        }).select('_id');
        const courseIds = userCourses.map((course) => course._id);
        assessmentQuery = { ...assessmentQuery, course: { $in: courseIds } };
      }
    } else {
      if (!courseId) {
        return NextResponse.json(
          { error: 'Course ID is required' },
          { status: 400 }
        );
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      assessmentQuery.course = courseId;
    }
    const assignments = await Assessment.find(assessmentQuery)
      .sort({ createdAt: -1 })
      .lean();

    const assignmentResponses: AssignmentApiResponse[] = assignments.map(
      (assignment) => ({
        id: (assignment._id as mongoose.Types.ObjectId).toString(),
        title: assignment.title as string,
        description: assignment.description as string,
        dueDate: assignment.dueDate
          ? (assignment.dueDate as Date).toISOString()
          : '',
        points: assignment.totalPoints as number,
        courseId: (assignment.course as mongoose.Types.ObjectId)?.toString(),
        createdAt: assignment.createdAt
          ? (assignment.createdAt as Date).toISOString()
          : undefined,
        updatedAt: assignment.updatedAt
          ? (assignment.updatedAt as Date).toISOString()
          : undefined,
        questions: assignment.questions || [],
      })
    );

    if (includeAllCourses) {
      return NextResponse.json({
        success: true,
        assignments: assignmentResponses,
      });
    } else {
      const response: AssignmentListResponse = {
        assignments: assignmentResponses,
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(courseId);
    const isDevelopmentMode = process.env.NODE_ENV === 'development';

    let course = null;
    if (isValidObjectId) {
      course = await Course.findById(courseId);
      if (!course && !isDevelopmentMode) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    } else if (!isDevelopmentMode) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    if (!isDevelopmentMode) {
      const session = await getServerSession(authOptions);
      if (
        !session ||
        !session.user ||
        session.user.currentRole !== 'instructor'
      ) {
        return NextResponse.json(
          { error: 'Unauthorized. Only instructors can create assignments.' },
          { status: 403 }
        );
      }
      if (course && course.instructor.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only create assignments for your own courses.' },
          { status: 403 }
        );
      }
    }

    const body: AssignmentApiRequest = await req.json();

    const trimmedDescription = body.description?.trim();
    const textOnlyDescription = trimmedDescription
      ?.replace(/<[^>]*>/g, '')
      .trim();

    if (
      !body.title ||
      !textOnlyDescription ||
      !body.dueDate ||
      body.points === undefined
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields: title, description, dueDate, points',
        },
        { status: 400 }
      );
    }

    let finalCourseId = courseId;
    if (!isValidObjectId && isDevelopmentMode) {
      const testCourseIds: { [key: string]: string } = {
        'course-001': '507f1f77bcf86cd799439011',
        'course-002': '507f1f77bcf86cd799439012',
        'course-003': '507f1f77bcf86cd799439013',
        '507f1f77bcf86cd799439011': '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012': '507f1f77bcf86cd799439012',
        '507f1f77bcf86cd799439013': '507f1f77bcf86cd799439013',
        '6842ba9dfc2972e671d5a48c': '6842ba9dfc2972e671d5a48c',
      };
      finalCourseId = testCourseIds[courseId] || courseId;
    }

    const newAssignment = new Assessment({
      title: body.title,
      description: trimmedDescription,
      course: finalCourseId,
      type: 'assignment',
      dueDate: new Date(body.dueDate),
      totalPoints: body.points,
      questions: body.questions || [],
      submissions: [],
    });

    const savedAssignment = await newAssignment.save();

    const assignmentResponse: AssignmentApiResponse = {
      id: savedAssignment._id.toString(),
      title: savedAssignment.title,
      description: savedAssignment.description,
      dueDate: savedAssignment.dueDate?.toISOString() || '',
      points: savedAssignment.totalPoints,
      questions: savedAssignment.questions || [],
    };

    return NextResponse.json(assignmentResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
