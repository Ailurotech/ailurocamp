import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import { SubmissionDocument, SubmissionRequest, SubmissionResponse } from '@/types/submission';

/**
 * POST /api/assessments/:id/submissions
 * 学生提交作业答案
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const body: SubmissionRequest = await request.json();
    const { studentId, answers } = body;
    
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

    // 创建新的提交记录
    const newSubmission = {
      student: studentId,
      answers: answers.map((answer) => ({
        questionIndex: answer.questionIndex,
        answer: answer.answer
      })),
      submittedAt: new Date(),
    };

    // 检查是否已有提交记录
    const existingSubmissionIndex = assessment.submissions?.findIndex(
      (sub: SubmissionDocument) => sub.student.toString() === studentId
    );

    if (existingSubmissionIndex !== undefined && existingSubmissionIndex >= 0) {
      // 更新现有提交
      assessment.submissions[existingSubmissionIndex] = newSubmission;
    } else {
      // 添加新提交
      if (!assessment.submissions) {
        assessment.submissions = [];
      }
      assessment.submissions.push(newSubmission);
    }

    // 保存到数据库
    await assessment.save();

    // 返回提交记录
    const savedSubmission = assessment.submissions[
      existingSubmissionIndex >= 0 ? existingSubmissionIndex : assessment.submissions.length - 1
    ];

    const response: SubmissionResponse = {
      id: savedSubmission._id?.toString() || '',
      assignmentId: assessmentId,
      studentId: savedSubmission.student.toString(),
      answers: savedSubmission.answers,
      submittedAt: savedSubmission.submittedAt.toISOString(),
      score: savedSubmission.score,
      feedback: savedSubmission.feedback,
      gradedAt: savedSubmission.gradedAt?.toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
