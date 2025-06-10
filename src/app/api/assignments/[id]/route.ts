import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';

interface AssessmentDocument {
  _id: string;
  title: string;
  description: string;
  dueDate?: Date;
  totalPoints: number;
  course: string;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    await connectDB();    // 首先尝试从Assessment集合中查找
    const assignment = await Assessment.findOne({ 
      _id: id,
      type: 'assignment'
    }).lean() as AssessmentDocument | null;    if (!assignment) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Assignment not found',
          message: 'The requested assignment does not exist or has been deleted.'
        },
        { status: 404 }
      );
    }

    // 转换为API响应格式
    const response = {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate?.toISOString(),
      points: assignment.totalPoints,
      courseId: assignment.course.toString(),
      createdAt: assignment.createdAt?.toISOString(),
      updatedAt: assignment.updatedAt?.toISOString(),
    };

    return NextResponse.json(response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get assignment error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, dueDate, totalPoints } = body;    await connectDB();

    // 在Assessment集合中更新作业
    const updatedAssignment = await Assessment.findOneAndUpdate(
      { _id: id, type: 'assignment' },
      {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        totalPoints,
        updatedAt: new Date()
      },
      { new: true, lean: true }
    ) as AssessmentDocument | null;

    if (!updatedAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment: {
        id: updatedAssignment._id.toString(),
        title: updatedAssignment.title,
        description: updatedAssignment.description,
        dueDate: updatedAssignment.dueDate ? updatedAssignment.dueDate.toISOString() : null,
        totalPoints: updatedAssignment.totalPoints,
        courseId: updatedAssignment.course,
        type: updatedAssignment.type
      }
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }    await connectDB();

    // 从Assessment集合中删除作业
    const deletedAssignment = await Assessment.findOneAndDelete({
      _id: id,
      type: 'assignment'
    });

    if (!deletedAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assignment error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
