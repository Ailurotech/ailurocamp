import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import { SubmissionDocument, SubmissionResponse } from '@/types/submission';
import { requireAuth } from '@/lib/apiUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const { id: assessmentId, studentId } = await params;

    const { response: authResponse } = await requireAuth();
    if (authResponse) return authResponse;

    await connectDB();

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const submission = assessment.submissions?.find(
      (sub: SubmissionDocument) => sub.student.toString() === studentId
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const formattedSubmission: SubmissionResponse = {
      id: submission._id?.toString() || submission.id || '',
      assignmentId: assessmentId,
      studentId: submission.student.toString(),
      answers: submission.answers.map(
        (answer: SubmissionDocument['answers'][0]) => ({
          questionIndex: answer.questionIndex,
          answer: answer.answer || '',
        })
      ),
      submittedAt: submission.submittedAt.toISOString(),
      score: submission.score,
      feedback: submission.feedback,
      gradedAt: submission.gradedAt?.toISOString(),
    };

    return NextResponse.json({
      submission: formattedSubmission,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
