'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Assignment, AssessmentSubmission } from '@/types/assignment';
import { assignmentService } from '@/lib/assignmentService';

export default function DashboardAssignmentSubmissionPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = React.use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<AssessmentSubmission | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const fetchAssignmentAndSubmission = React.useCallback(async () => {
    try {
      setLoading(true);

      // 使用 API 获取作业信息
      const assignment =
        await assignmentService.getAssignmentById(assignmentId);

      if (assignment) {
        setAssignment(assignment);

        // 获取真实的提交记录（如果存在）
        const studentId = session?.user?.id || 'student-1';
        const existingSubmission = assignment.submissions?.find(
          (sub) => sub.student === studentId
        );

        if (existingSubmission) {
          // 使用已存在的提交记录
          setSubmission(existingSubmission);
        } else {
          // 如果没有提交记录，表示学生还没有提交这个作业
          setSubmission(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch assignment or submission:', error);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, session?.user?.id]);

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

  const formatTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString();
  };

  const getScorePercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  const renderAnswerDisplay = (
    question: NonNullable<Assignment['questions']>[number],
    answer: string | string[] | null
  ) => {
    if (!answer)
      return <span className="text-gray-500">No answer provided</span>;

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return <span className="font-medium">{answer}</span>;

      case 'short-answer':
      case 'essay':
        return (
          <div className="bg-gray-50 p-3 rounded border">
            <pre className="whitespace-pre-wrap text-sm">{answer}</pre>
          </div>
        );

      case 'coding':
        return (
          <div className="bg-gray-50 p-3 rounded border">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {answer}
            </pre>
          </div>
        );

      case 'file-upload':
        return (
          <div className="bg-blue-50 p-3 rounded border">
            <span className="text-blue-800 font-medium">📎 {answer}</span>
          </div>
        );

      default:
        return <span>{answer}</span>;
    }
  };

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

  if (!assignment) {
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

  if (!submission) {
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
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/assignments"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to All Assignments
          </Link>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {assignment.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-500">Points</div>
                <div className="text-lg font-semibold">
                  {assignment.totalPoints || assignment.points || 0}
                </div>
              </div>
              {assignment.dueDate && (
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Due Date</div>
                  <div className="text-lg font-semibold">
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: assignment.description }}
            />
          </div>
        </div>

        {/* Submission Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📋 Submission Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm text-green-600">Status</div>
              <div className="text-lg font-semibold text-green-800">
                Submitted
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm text-blue-600">Submitted At</div>
              <div className="text-lg font-semibold text-blue-800">
                {formatTime(submission.submittedAt)}
              </div>
            </div>
            {submission.score !== undefined && (
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-sm text-purple-600">Score</div>
                <div className="text-lg font-semibold text-purple-800">
                  {submission.score} /{' '}
                  {assignment.totalPoints || assignment.points || 0} (
                  {getScorePercentage(
                    submission.score || 0,
                    assignment.totalPoints || assignment.points || 0
                  )}
                  %)
                </div>
              </div>
            )}
          </div>

          {submission.feedback && (
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">
                Instructor Feedback
              </h3>
              <p className="text-yellow-700">{submission.feedback}</p>
              {submission.gradedAt && (
                <p className="text-sm text-yellow-600 mt-2">
                  Graded at: {formatTime(submission.gradedAt)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Submitted Answers */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            📝 Your Answers
          </h2>

          {assignment.questions?.map((question, index) => {
            const answer = submission.answers.find(
              (a) => a.questionIndex === index
            )?.answer;

            return (
              <div
                key={question.id || question.title || `question-${index}`}
                className="bg-white rounded-lg border p-6 mb-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Question {index + 1}
                  </h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {question.points} pts
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {question.title}
                  </p>
                </div>

                {/* Display Options for Multiple Choice */}
                {question.type === 'multiple-choice' && question.options && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-600 mb-2">Options:</h4>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={`option-${optionIndex}`}
                          className="flex items-center space-x-2"
                        >
                          <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span className="text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Your Answer */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-600 mb-2">
                    Your Answer:
                  </h4>
                  {renderAnswerDisplay(question, answer || null)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
