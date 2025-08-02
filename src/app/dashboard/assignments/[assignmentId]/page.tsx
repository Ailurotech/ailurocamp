'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Assignment } from '@/types/assignment';
import { assignmentService } from '@/lib/assignmentService';
import {
  AssignmentTakingHeader,
  AssignmentQuestionRenderer,
  SubmissionControls,
} from '@/components/assignment/Dashboard';

export default function DashboardAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = React.use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const fetchAssignment = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const assignment =
        await assignmentService.getAssignmentById(assignmentId);

      if (assignment) {
        setAssignment(assignment);

        if (assignment.timeLimit && assignment.timeLimit > 0) {
          setTimeRemaining(assignment.timeLimit * 60);
        }
      } else {
        setError('Assignment not found');
      }
    } catch (err) {
      setError('Failed to fetch assignment');
      console.error('Error fetching assignment:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

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

    fetchAssignment();
  }, [session, sessionStatus, router, fetchAssignment]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerChange = (
    questionId: string,
    answer: string | string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleFileUpload = (questionId: string, file: File) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [questionId]: file,
    }));
    // Also update answers to show file name
    setAnswers((prev) => ({
      ...prev,
      [questionId]: file.name,
    }));
  };

  const handleSubmit = async () => {
    if (submitting || !assignment) return;

    try {
      setSubmitting(true);

      // Convert answers to the format expected by the new API
      const submissionData = {
        studentId: session?.user?.id || 'student-1', // Add studentId field
        answers:
          assignment.questions?.map((question, index) => {
            const questionId =
              question.id || question.title || `question-${index}`;
            return {
              questionIndex: index, // Use questionIndex instead of questionId
              answer: answers[questionId] || '',
            };
          }) || [],
      };

      // Submit to API
      const response = await fetch(
        `/api/assessments/${assignmentId}/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assignment');
      }

      const result = await response.json();
      console.log('Assignment submitted successfully:', result);
      alert('Assignment submitted successfully!');
      router.push(`/dashboard/assignments/${assignmentId}/submission`);
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert(
        `Failed to submit assignment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Link
            href="/dashboard/assignments"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Assignment not found</div>
          <Link
            href="/dashboard/assignments"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const totalQuestions = assignment.questions?.length || 0;
  const answeredQuestions = Object.values(answers).filter(
    (answer) => answer !== null && answer !== undefined && answer !== ''
  ).length;
  const isComplete = answeredQuestions === totalQuestions;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <AssignmentTakingHeader
          assignment={assignment}
          timeRemaining={timeRemaining}
          answeredQuestions={answeredQuestions}
          totalQuestions={totalQuestions}
        />

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {assignment.questions?.map((question, index) => {
            const questionId =
              question.id || question.title || `question-${index}`;
            const currentAnswer = answers[questionId];

            return (
              <AssignmentQuestionRenderer
                key={questionId}
                question={question}
                index={index}
                currentAnswer={currentAnswer}
                uploadedFiles={uploadedFiles}
                onAnswerChange={handleAnswerChange}
                onFileUpload={handleFileUpload}
              />
            );
          })}
        </div>

        {/* Submit Section */}
        <SubmissionControls
          answeredQuestions={answeredQuestions}
          totalQuestions={totalQuestions}
          isComplete={isComplete}
          submitting={submitting}
          timeRemaining={timeRemaining}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
