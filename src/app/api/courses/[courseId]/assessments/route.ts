import { NextRequest, NextResponse } from 'next/server';
import { AssignmentApiRequest, AssignmentApiResponse, AssignmentListResponse } from '@/types/assignment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';


export async function GET(
  _req: NextRequest,
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

    // 验证课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // 获取该课程的所有作业（type为assignment的评估）
    const assignments = await Assessment.find({ 
      course: courseId,
      type: 'assignment'
    })
      .sort({ createdAt: -1 })
      .lean();

    // 转换为API响应格式
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentResponses: AssignmentApiResponse[] = assignments.map((assignment: any) => ({
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate?.toISOString() || '',
      points: assignment.totalPoints, // Assessment模型中是totalPoints
    }));

    const response: AssignmentListResponse = {
      assignments: assignmentResponses
    };

    return NextResponse.json(response);
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
    }    await connectDB();

    // 开发模式：如果课程ID不是有效的ObjectId，跳过验证
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(courseId);
    const isDevelopmentMode = process.env.NODE_ENV === 'development';
    
    let course = null;
    if (isValidObjectId) {
      // 验证课程是否存在
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

    // 权限验证（开发模式可以跳过）
    if (!isDevelopmentMode) {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || session.user.currentRole !== 'instructor') {
        return NextResponse.json(
          { error: 'Unauthorized. Only instructors can create assignments.' },
          { status: 403 }
        );
      }

      // 验证讲师是否拥有该课程
      if (course && course.instructor.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only create assignments for your own courses.' },
          { status: 403 }
        );
      }
    }

    const body: AssignmentApiRequest = await req.json();

    // Validate required fields
    if (!body.title || !body.description || !body.dueDate || body.points === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, dueDate, points' },
        { status: 400 }
      );
    }    // 创建新作业（作为Assessment记录）
    let finalCourseId = courseId;
      // 开发模式：如果课程ID不是有效的ObjectId，创建一个临时的ObjectId
    if (!isValidObjectId && isDevelopmentMode) {
      // 为开发模式的测试课程创建固定的ObjectId（与课程API保持一致）
      const testCourseIds: { [key: string]: string } = {
        'course-001': '507f1f77bcf86cd799439011',
        'course-002': '507f1f77bcf86cd799439012', 
        'course-003': '507f1f77bcf86cd799439013',
        // 支持从课程API返回的测试课程ID
        '507f1f77bcf86cd799439011': '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012': '507f1f77bcf86cd799439012',
        '507f1f77bcf86cd799439013': '507f1f77bcf86cd799439013',
        '6842ba9dfc2972e671d5a48c': '6842ba9dfc2972e671d5a48c',
      };
      finalCourseId = testCourseIds[courseId] || courseId;
    }

    const newAssignment = new Assessment({
      title: body.title,
      description: body.description,
      course: finalCourseId,
      type: 'assignment', // 设置类型为assignment
      dueDate: new Date(body.dueDate),
      totalPoints: body.points, // Assessment模型中是totalPoints
      questions: [], // 默认为空，可以后续添加问题
      submissions: [], // 初始化为空数组
    });

    const savedAssignment = await newAssignment.save();

    // 转换为API响应格式
    const assignmentResponse: AssignmentApiResponse = {
      id: savedAssignment._id.toString(),
      title: savedAssignment.title,
      description: savedAssignment.description,
      dueDate: savedAssignment.dueDate?.toISOString() || '',
      points: savedAssignment.totalPoints, // Assessment模型中是totalPoints
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
