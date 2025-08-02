import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import {
  SubmissionDocument,
  SubmissionRequest,
  SubmissionResponse,
} from '@/types/submission';
import { requireAuth } from '@/lib/apiUtils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const body: SubmissionRequest = await request.json();
    const { studentId, answers } = body;

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

    const newSubmission = {
      student: studentId,
      answers: answers.map((answer) => ({
        questionIndex: answer.questionIndex,
        answer: answer.answer,
      })),
      submittedAt: new Date(),
    };

    const existingSubmissionIndex = assessment.submissions?.findIndex(
      (sub: SubmissionDocument) => sub.student.toString() === studentId
    );

    if (existingSubmissionIndex !== undefined && existingSubmissionIndex >= 0) {
      assessment.submissions[existingSubmissionIndex] = newSubmission;
    } else {
      if (!assessment.submissions) {
        assessment.submissions = [];
      }
      assessment.submissions.push(newSubmission);
    }

    await assessment.save();

    const savedSubmission =
      assessment.submissions[
        existingSubmissionIndex >= 0
          ? existingSubmissionIndex
          : assessment.submissions.length - 1
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
