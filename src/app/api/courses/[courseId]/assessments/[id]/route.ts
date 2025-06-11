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

    // 跨课程查询模式：courseId为"all"时，跳过课程验证
    if (courseId !== 'all') {
      // 验证课程是否存在
      const course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    }

    // 查找指定的作业（type为assignment的评估）
    const assessmentQuery: { 
      _id: string; 
      type: string;
      course?: string;
    } = { 
      _id: id, 
      type: 'assignment'
    };
    
    // 只有在非跨课程模式下才添加course条件
    if (courseId !== 'all') {
      assessmentQuery.course = courseId;
    }
    
    const assignment = await Assessment.findOne(assessmentQuery).lean() as AssessmentDocument | null;

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }    // 转换为API响应格式
    const assignmentResponse: AssignmentApiResponse = {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate?.toISOString() || '',
      points: assignment.totalPoints,
      questions: assignment.questions || [], // 包含 questions 数据
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

    // 跨课程查询模式：courseId为"all"时，跳过课程验证
    let course = null;
    if (courseId !== 'all') {
      // 验证课程是否存在
      course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    }

    // 验证用户权限（只有讲师可以更新作业）
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.currentRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Unauthorized. Only instructors can update assignments.' },
        { status: 403 }
      );
    }

    // 验证讲师是否拥有该课程（跨课程模式下跳过）
    if (course && course.instructor.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update assignments for your own courses.' },
        { status: 403 }
      );
    }

    const body: AssignmentApiRequest = await req.json();

    // Validate required fields
    if (!body.title || !body.description || !body.dueDate || body.points === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, dueDate, points' },
        { status: 400 }
      );
    }    // 查找并更新指定的作业
    const updateQuery: { 
      _id: string; 
      type: string;
      course?: string;
    } = { 
      _id: id, 
      type: 'assignment'
    };
    
    // 只有在非跨课程模式下才添加course条件
    if (courseId !== 'all') {
      updateQuery.course = courseId;
    }
    
    const updatedAssignment = await Assessment.findOneAndUpdate(
      updateQuery,
      {
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate),
        totalPoints: body.points,
      },
      { new: true }
    ) as AssessmentDocument | null;

    if (!updatedAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // 转换为API响应格式
    const assignmentResponse: AssignmentApiResponse = {
      id: updatedAssignment._id.toString(),
      title: updatedAssignment.title,
      description: updatedAssignment.description,
      dueDate: updatedAssignment.dueDate?.toISOString() || '',
      points: updatedAssignment.totalPoints,
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

    // 跨课程查询模式：courseId为"all"时，跳过课程验证
    let course = null;
    if (courseId !== 'all') {
      // 验证课程是否存在
      course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    }

    // 验证用户权限（只有讲师可以删除作业）
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.currentRole !== 'instructor') {
      return NextResponse.json(
        { error: 'Unauthorized. Only instructors can delete assignments.' },
        { status: 403 }
      );
    }

    // 验证讲师是否拥有该课程（跨课程模式下跳过）
    if (course && course.instructor.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete assignments for your own courses.' },
        { status: 403 }
      );
    }

    // 查找并删除指定的作业
    const deleteQuery: { 
      _id: string; 
      type: string;
      course?: string;
    } = { 
      _id: id, 
      type: 'assignment'
    };
    
    // 只有在非跨课程模式下才添加course条件
    if (courseId !== 'all') {
      deleteQuery.course = courseId;
    }
    
    const deletedAssignment = await Assessment.findOneAndDelete(deleteQuery);

    if (!deletedAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }    return NextResponse.json(
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