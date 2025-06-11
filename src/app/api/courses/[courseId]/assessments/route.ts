import { NextRequest, NextResponse } from 'next/server';
import { AssignmentApiRequest, AssignmentApiResponse, AssignmentListResponse } from '@/types/assignment';
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
    } = { type: 'assignment' };    if (includeAllCourses) {
      // 跨课程查询模式
      if (instructorId) {
        // 获取该讲师的所有课程的作业
        const instructorCourses = await Course.find({ instructor: instructorId }).select('_id');
        const courseIds = instructorCourses.map(course => course._id);
        assessmentQuery = { ...assessmentQuery, course: { $in: courseIds } };
      } else if (userId) {
        // 获取该用户注册课程的作业
        const userCourses = await Course.find({ enrolledStudents: userId }).select('_id');
        const courseIds = userCourses.map(course => course._id);
        assessmentQuery = { ...assessmentQuery, course: { $in: courseIds } };
      }
      // 如果都没指定，返回所有类型为assignment的作业
    } else {
      // 单课程查询模式（原有逻辑）
      if (!courseId) {
        return NextResponse.json(
          { error: 'Course ID is required' },
          { status: 400 }
        );
      }

      // 验证课程是否存在
      const course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      assessmentQuery.course = courseId;
    }// 获取作业
    const assignments = await Assessment.find(assessmentQuery)
      .sort({ createdAt: -1 })
      .lean();    // 转换为API响应格式
    const assignmentResponses: AssignmentApiResponse[] = assignments.map((assignment) => ({
      id: (assignment._id as mongoose.Types.ObjectId).toString(),
      title: assignment.title as string,
      description: assignment.description as string,
      dueDate: assignment.dueDate ? (assignment.dueDate as Date).toISOString() : '',
      points: assignment.totalPoints as number, // Assessment模型中是totalPoints
      courseId: (assignment.course as mongoose.Types.ObjectId)?.toString(),
      createdAt: assignment.createdAt ? (assignment.createdAt as Date).toISOString() : undefined,
      updatedAt: assignment.updatedAt ? (assignment.updatedAt as Date).toISOString() : undefined,
      questions: assignment.questions || [], // 包含 questions 数据
    }));

    // 根据查询模式返回不同格式
    if (includeAllCourses) {
      // 兼容原 /api/assignments 的响应格式
      return NextResponse.json({
        success: true,
        assignments: assignmentResponses
      });
    } else {
      // 保持原有的课程特定响应格式
      const response: AssignmentListResponse = {
        assignments: assignmentResponses
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
) {  try {
    const { courseId } = await context.params;
    
    console.log('POST /api/courses/[courseId]/assessments - courseId:', courseId);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }    await connectDB();    // 开发模式：如果课程ID不是有效的ObjectId，跳过验证
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(courseId);
    const isDevelopmentMode = process.env.NODE_ENV === 'development';
    
    console.log('Development mode:', isDevelopmentMode);
    console.log('Valid ObjectId:', isValidObjectId);
    
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
    }    const body: AssignmentApiRequest = await req.json();
    
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('Field validation:');
    console.log('  title:', body.title, 'exists:', !!body.title);
    console.log('  description:', body.description, 'exists:', !!body.description);
    console.log('  dueDate:', body.dueDate, 'exists:', !!body.dueDate);
    console.log('  points:', body.points, 'exists:', body.points !== undefined);    // Validate required fields
    const trimmedDescription = body.description?.trim();
    // 清理 HTML 标签后检查是否有实际内容
    const textOnlyDescription = trimmedDescription?.replace(/<[^>]*>/g, '').trim();
    
    if (!body.title || !textOnlyDescription || !body.dueDate || body.points === undefined) {
      console.log('Validation failed - missing fields:');
      if (!body.title) console.log('  - title is missing or empty');
      if (!textOnlyDescription) console.log('  - description is missing or empty (after removing HTML tags)');
      if (!body.dueDate) console.log('  - dueDate is missing or empty');
      if (body.points === undefined) console.log('  - points is undefined');
      
      return NextResponse.json(
        { error: 'Missing required fields: title, description, dueDate, points' },
        { status: 400 }
      );
    }// 创建新作业（作为Assessment记录）
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
    }    const newAssignment = new Assessment({
      title: body.title,
      description: trimmedDescription,
      course: finalCourseId,
      type: 'assignment', // 设置类型为assignment
      dueDate: new Date(body.dueDate),
      totalPoints: body.points, // Assessment模型中是totalPoints
      questions: body.questions || [], // 包含来自表单的 questions 数据
      submissions: [], // 初始化为空数组
    });const savedAssignment = await newAssignment.save();
    
    console.log('Assignment saved successfully:', savedAssignment._id);    // 转换为API响应格式
    const assignmentResponse: AssignmentApiResponse = {
      id: savedAssignment._id.toString(),
      title: savedAssignment.title,
      description: savedAssignment.description,
      dueDate: savedAssignment.dueDate?.toISOString() || '',
      points: savedAssignment.totalPoints, // Assessment模型中是totalPoints
      questions: savedAssignment.questions || [], // 包含 questions 数据
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
