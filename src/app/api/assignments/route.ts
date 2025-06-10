import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';

interface ApiAssignmentItem {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  points?: number;
  courseId?: string;  createdAt?: string;
  updatedAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const userId = searchParams.get('userId');

    let assessmentQuery: {
      type: string;
      course?: { $in: string[] };
    } = { type: 'assignment' };
    
    if (instructorId) {
      // 如果指定了instructorId，获取该讲师的所有课程的作业
      const instructorCourses = await Course.find({ instructor: instructorId }).select('_id');
      const courseIds = instructorCourses.map(course => course._id);
      assessmentQuery = { ...assessmentQuery, course: { $in: courseIds } };
    } else if (userId) {
      // 如果指定了userId，获取该用户注册课程的作业
      const userCourses = await Course.find({ enrolledStudents: userId }).select('_id');
      const courseIds = userCourses.map(course => course._id);
      assessmentQuery = { ...assessmentQuery, course: { $in: courseIds } };
    }
    // 如果都没指定，返回所有类型为assignment的作业

    // 从Assessment集合中获取作业
    const assessments = await Assessment.find(assessmentQuery)
      .sort({ createdAt: -1 })
      .lean();      // 转换为API响应格式
    const assignments: ApiAssignmentItem[] = assessments.map((assessment) => ({
      id: assessment._id?.toString() || '',
      title: assessment.title || '',
      description: assessment.description || '',
      dueDate: assessment.dueDate?.toISOString(),
      points: assessment.totalPoints,
      courseId: assessment.course?.toString(),
      createdAt: assessment.createdAt?.toISOString(),
      updatedAt: assessment.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      assignments: assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch assignments',
      message: 'Database connection error or internal server error',
      assignments: []
    }, { status: 500 });
  }
}
