import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { ICourse } from '@/models/Course';

// GET all published courses (public access for course selection)
export async function GET(): Promise<NextResponse> {
  try {
    // Basic authentication check (users need to be logged in)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get all published courses for course selection
    const courses: ICourse[] = await Course.find({ status: 'published' })
      .select('_id title description instructor category level price')
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });

    // 如果是开发模式且没有课程数据，提供一些测试课程
    const isDevelopmentMode = process.env.NODE_ENV === 'development';
    if (isDevelopmentMode && courses.length === 0) {
      const testCourses = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: '计算机科学基础',
          description: '计算机科学的入门课程，涵盖基础概念和编程思维',
          instructor: { name: '张教授' },
          category: '编程',
          level: '初级',
          price: 299
        },
        {
          _id: '507f1f77bcf86cd799439012',
          title: '数据结构与算法',
          description: '深入学习数据结构和算法设计',
          instructor: { name: '李教授' },
          category: '编程',
          level: '中级',
          price: 499
        },
        {
          _id: '507f1f77bcf86cd799439013',
          title: 'Web开发实践',
          description: '现代Web开发技术和实践项目',
          instructor: { name: '王教授' },
          category: '前端开发',
          level: '高级',
          price: 699
        },
        {
          _id: '6842ba9dfc2972e671d5a48c',
          title: 'JavaScript 基础',
          description: 'JavaScript编程语言基础教程',
          instructor: { name: '赵教师' },
          category: '编程',
          level: '初级',
          price: 199
        }
      ];
      
      return NextResponse.json({ 
        courses: testCourses,
        message: 'Development mode: Using test courses data'
      }, { status: 200 });
    }

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error fetching courses', error: (error as Error).message },
      { status: 500 }
    );
  }
}
