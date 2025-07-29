import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';

// 提交记录的类型定义
interface SubmissionDocument {
  _id?: string;
  id?: string;
  student: {
    toString(): string;
  };
  answers: Array<{
    questionIndex: number;
    answer: string | string[];
  }>;
  submittedAt: Date;
  score?: number;
  feedback?: string;
  gradedAt?: Date;
}

/**
 * GET /api/courses/:courseId/assessments/:id/submissions/:studentId
 * 获取特定学生的作业提交记录
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; id: string; studentId: string }> }
) {
  try {
    const { id: assessmentId, studentId } = await params;
    
    // 验证会话
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 连接数据库
    await connectDB();

    // 查找assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // 查找学生的提交记录
    const submission = assessment.submissions?.find(
      (sub: SubmissionDocument) => sub.student.toString() === studentId
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // 格式化返回数据
    const formattedSubmission = {
      id: submission._id?.toString() || submission.id,
      assignmentId: assessmentId,
      studentId: submission.student.toString(),
      answers: submission.answers.map((answer: SubmissionDocument['answers'][0]) => ({
        questionIndex: answer.questionIndex,
        answer: answer.answer || ''
      })),
      submittedAt: submission.submittedAt.toISOString(),
      score: submission.score,
      feedback: submission.feedback,
      gradedAt: submission.gradedAt?.toISOString(),
    };

    return NextResponse.json({
      submission: formattedSubmission
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
