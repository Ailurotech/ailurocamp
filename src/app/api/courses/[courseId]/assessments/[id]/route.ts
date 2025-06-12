import { NextRequest, NextResponse } from 'next/server';
import { AssignmentApiRequest, AssignmentApiResponse } from '@/types/assignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';

interface AssessmentDocument {
  _id: string;
  title: string;
  description: string;
  dueDate?: Date;
  totalPoints: number;
  course: string;
  type: string;
  questions?: {
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    options?: string[];
    correctAnswer?: string | string[];
    points: number;
  }[];
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ courseId: string; id: string }> }
) {
  try {
    const { courseId, id } = await context.params;
    
    if (!courseId || !id) {
      return NextResponse.json(
        { error: 'Course ID and Assignment ID are required' },
        { status: 400 }
      );
    }    await connectDB();

    if (courseId !== 'all') {
      const course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    }

    const assessmentQuery: { 
      _id: string; 
      type: string;
      course?: string;
    } = { 
      _id: id, 
      type: 'assignment'
    };
    
    if (courseId !== 'all') {
      assessmentQuery.course = courseId;
    }
    
    const assignment = await Assessment.findOne(assessmentQuery).lean() as AssessmentDocument | null;

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }    const assignmentResponse: AssignmentApiResponse = {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate?.toISOString() || '',
      points: assignment.totalPoints,
      questions: assignment.questions || [],
    };

    return NextResponse.json({
      success: true,
      assignment: assignmentResponse
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ courseId: string; id: string }> }
) {
  try {
    const { courseId, id } = await context.params;
    
    if (!courseId || !id) {
      return NextResponse.json(
        { error: 'Course ID and Assignment ID are required' },
        { status: 400 }
      );
    }    await connectDB();

    let course = null;
    if (courseId !== 'all') {
      course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.currentRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Unauthorized. Only instructors can update assignments.' },
        { status: 403 }
      );
    }

    if (course && course.instructor.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update assignments for your own courses.' },
        { status: 403 }
      );
    }

    const body: AssignmentApiRequest = await req.json();

    
    if (!body.title || !body.description || !body.dueDate || body.points === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, dueDate, points' },
        { status: 400 }
      );
    }    const updateQuery: { 
      _id: string; 
      type: string;
      course?: string;
    } = { 
      _id: id, 
      type: 'assignment'
    };
    
    if (courseId !== 'all') {
      updateQuery.course = courseId;
    }
      const updatedAssignment = await Assessment.findOneAndUpdate(
      updateQuery,
      {
        title: body.title,        description: body.description,
        dueDate: new Date(body.dueDate),
        totalPoints: body.points,
        ...(body.questions && { questions: body.questions }),
      },
      { new: true }
    ) as AssessmentDocument | null;

    if (!updatedAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const assignmentResponse: AssignmentApiResponse = {
      id: updatedAssignment._id.toString(),
      title: updatedAssignment.title,
      description: updatedAssignment.description,
      dueDate: updatedAssignment.dueDate?.toISOString() || '',
      points: updatedAssignment.totalPoints,
      courseId: updatedAssignment.course?.toString(),
      createdAt: (updatedAssignment as unknown as { createdAt: Date }).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: (updatedAssignment as unknown as { updatedAt: Date }).updatedAt?.toISOString() || new Date().toISOString(),
      questions: updatedAssignment.questions?.map(q => {
        const extendedQuestion = q as unknown as {
          question: string;
          type: string;
          options?: string[];
          correctAnswer?: string | string[];
          points: number;
          testCases?: Array<{
            input: string;
            output: string;
            file?: string | { name: string; url: string; size: number; type: string };
          }>;
          fileType?: string;
          maxFileSize?: number;
        };
        
        return {
          question: extendedQuestion.question,
          type: extendedQuestion.type as 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload',
          options: extendedQuestion.options,
          correctAnswer: extendedQuestion.correctAnswer,
          points: extendedQuestion.points,
          testCases: extendedQuestion.testCases,
          fileType: extendedQuestion.fileType,
          maxFileSize: extendedQuestion.maxFileSize,
        };
      }) || [],
    };

    return NextResponse.json(assignmentResponse);
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ courseId: string; id: string }> }
) {
  try {
    const { courseId, id } = await context.params;
    
    if (!courseId || !id) {
      return NextResponse.json(
        { error: 'Course ID and Assignment ID are required' },
        { status: 400 }
      );
    }    await connectDB();

    let course = null;
    if (courseId !== 'all') {
      course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.currentRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Unauthorized. Only instructors can delete assignments.' },
        { status: 403 }
      );
    }

    if (course && course.instructor.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete assignments for your own courses.' },
        { status: 403 }
      );
    }

    const deleteQuery: {
      _id: string; 
      type: string;
      course?: string;
    } = { 
      _id: id, 
      type: 'assignment'
    };
    
    if (courseId !== 'all') {
      deleteQuery.course = courseId;
    }
    
    const deletedAssignment = await Assessment.findOneAndDelete(deleteQuery);    if (!deletedAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Assignment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}