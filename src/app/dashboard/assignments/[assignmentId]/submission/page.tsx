'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Assignment, AssessmentSubmission } from '@/types/assignment';
import { assignmentService } from '@/lib/assignmentService';
import { AssignmentHeader, SubmissionStatus, QuestionDisplay } from '@/components/assignment/Dashboard';

export default function DashboardAssignmentSubmissionPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = React.use(params);
  const [assignment, setAssignment] = useState<Assignment | undefined>(undefined);
  const [submission, setSubmission] = useState<AssessmentSubmission | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const fetchAssignmentAndSubmission = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const assignment = await assignmentService.getAssignmentById(assignmentId);

      if (assignment) {
        setAssignment(assignment);

        const studentId = session!.user.id;
        const submissionRecord = await assignmentService.getSubmissionByAssignmentAndStudent(
          assignmentId,
          studentId
        );

        if (submissionRecord) {
          setSubmission({
            id: submissionRecord.id,
            student: submissionRecord.studentId,
            answers: submissionRecord.answers.map(answer => ({
              questionIndex: answer.questionIndex,
              answer: answer.answer || '' 
            })),
            submittedAt: new Date(submissionRecord.submittedAt),
            score: submissionRecord.score,
            feedback: submissionRecord.feedback,
            gradedAt: submissionRecord.gradedAt ? new Date(submissionRecord.gradedAt) : undefined,
          } as AssessmentSubmission);
        } else {
          setSubmission(undefined);
        }
      } else {
        setAssignment(undefined);
      }
    } catch (error) {
      console.error('Failed to fetch assignment or submission:', error);
      setError('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  }, [assignmentId, session]);

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.currentRole !== 'student') {
      router.push('/');
      return;
    }

    fetchAssignmentAndSubmission();
  }, [session, sessionStatus, router, fetchAssignmentAndSubmission]);

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.currentRole !== 'student') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Assignment
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-4">
              <button
                onClick={() => fetchAssignmentAndSubmission()}
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <br />
              <Link
                href="/dashboard/assignments"
                className="text-blue-600 hover:underline"
              >
                ← Back to Assignments
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (assignment === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Assignment Not Found
            </h2>
            <p className="text-red-600 mb-4">
              The assignment could not be found.
            </p>
            <Link
              href="/dashboard/assignments"
              className="text-blue-600 hover:underline"
            >
              ← Back to Assignments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submission === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              No Submission Found
            </h2>
            <p className="text-yellow-600 mb-4">
              You haven&apos;t submitted this assignment yet.
            </p>
            <div className="space-y-4">
              <Link
                href={`/dashboard/assignments/${assignmentId}`}
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Assignment
              </Link>
              <br />
              <Link
                href="/dashboard/assignments"
                className="text-blue-600 hover:underline"
              >
                ← Back to Assignments
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
       
        <AssignmentHeader assignment={assignment} />

      
        <SubmissionStatus submission={submission} assignment={assignment} />

        
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            📝 Your Answers
          </h2>

          {assignment.questions?.map((question, index) => {
            const answer = submission.answers.find(
              (a) => a.questionIndex === index
            )?.answer || ''; 

            return (
              <QuestionDisplay
                key={question.id || question.title || `question-${index}`}
                question={question}
                questionIndex={index}
                answer={answer}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
