import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import mongoose from 'mongoose';

// 提交作业答案的请求类型
interface SubmissionRequest {
  answers: {
    questionId: string;
    answer: string | string[] | null;
  }[];
  submittedAt: string;
}

// 提交作业答案的响应类型
interface SubmissionResponse {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: {
    questionId: string;
    answer: string | string[] | null;
  }[];
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

// 数据库中的提交记录类型
interface SubmissionRecord {
  _id: string;
  student: mongoose.Types.ObjectId;
  answers: {
    questionIndex: number;
    answer: string | string[];
  }[];
  submittedAt: Date;
  score?: number;
  feedback?: string;
  gradedAt?: Date;
}

/**
 * POST /api/courses/:courseId/assessments/:id/submissions
 * 学生提交作业答案
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ courseId: string; id: string }> }
) {
  try {
    const { courseId, id: assignmentId } = await context.params;

    if (!courseId || !assignmentId) {
      return NextResponse.json(
        { error: 'Course ID and Assignment ID are required' },
        { status: 400 }
      );
    }

    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.currentRole !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized. Only students can submit assessments.' },
        { status: 403 }
      );
    }

    await connectDB();

    // 检查作业/测验是否存在
    const assignment = await Assessment.findOne({
      _id: assignmentId,
      course: courseId,
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // 检查是否已过截止时间
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      return NextResponse.json(
        { error: 'Assignment submission deadline has passed' },
        { status: 400 }
      );
    }

    // 解析请求体
    const body: SubmissionRequest = await req.json();

    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: 'Invalid submission format' },
        { status: 400 }
      );
    }

    // 检查是否已经提交过
    const existingSubmission = assignment.submissions.find(
      (sub: SubmissionRecord) => sub.student.toString() === session.user.id
    );

    const submissionData = {
      student: new mongoose.Types.ObjectId(session.user.id),
      answers: body.answers.map((ans, index) => ({
        questionIndex: index,
        answer: ans.answer,
      })),
      submittedAt: new Date(body.submittedAt || new Date()),
    };

    if (existingSubmission) {
      // 更新现有提交
      const submissionIndex = assignment.submissions.findIndex(
        (sub: SubmissionRecord) => sub.student.toString() === session.user.id
      );
      assignment.submissions[submissionIndex] = submissionData;
    } else {
      // 创建新提交
      assignment.submissions.push(submissionData);
    }

    // 保存到数据库
    const updatedAssignment = await assignment.save();

    // 找到刚才提交的记录
    const savedSubmission = updatedAssignment.submissions.find(
      (sub: SubmissionRecord) => sub.student.toString() === session.user.id
    );

    if (!savedSubmission) {
      console.error(
        'Failed to find saved submission. User ID:',
        session.user.id
      );
      console.error(
        'Available submissions:',
        updatedAssignment.submissions.map((sub: SubmissionRecord) => ({
          student: sub.student,
          id: sub._id,
        }))
      );
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    const response: SubmissionResponse = {
      id: savedSubmission._id.toString(),
      assignmentId: assignmentId,
      studentId: session.user.id,
      answers: body.answers,
      submittedAt: savedSubmission.submittedAt.toISOString(),
      score: savedSubmission.score,
      feedback: savedSubmission.feedback,
      gradedAt: savedSubmission.gradedAt?.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courses/:courseId/assessments/:id/submissions
 * 获取学生的作业提交记录
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ courseId: string; id: string }> }
) {
  try {
    const { courseId, id: assignmentId } = await context.params;

    if (!courseId || !assignmentId) {
      return NextResponse.json(
        { error: 'Course ID and Assignment ID are required' },
        { status: 400 }
      );
    }

    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    // 检查作业/测验是否存在
    const assignment = await Assessment.findOne({
      _id: assignmentId,
      course: courseId,
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // 查找学生的提交记录
    const studentSubmission = assignment.submissions.find(
      (sub: SubmissionRecord) => sub.student === session.user.id
    ) as SubmissionRecord;

    if (!studentSubmission) {
      return NextResponse.json(
        { error: 'No submission found' },
        { status: 404 }
      );
    }

    const response: SubmissionResponse = {
      id: studentSubmission._id.toString(),
      assignmentId: assignmentId,
      studentId: session.user.id,
      answers: studentSubmission.answers.map(
        (ans: SubmissionRecord['answers'][0], index: number) => ({
          questionId: `question-${index}`,
          answer: ans.answer,
        })
      ),
      submittedAt: studentSubmission.submittedAt.toISOString(),
      score: studentSubmission.score,
      feedback: studentSubmission.feedback,
      gradedAt: studentSubmission.gradedAt?.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
