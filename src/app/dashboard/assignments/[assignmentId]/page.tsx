'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Assignment } from '@/types/assignment';
import { assignmentService } from '@/lib/assignmentService';

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

      // 使用 API 获取作业数据
      const assignment =
        await assignmentService.getAssignmentById(assignmentId);

      if (assignment) {
        setAssignment(assignment);

        // 如果有时间限制，设置倒计时
        if (assignment.timeLimit && assignment.timeLimit > 0) {
          setTimeRemaining(assignment.timeLimit * 60); // 转换为秒
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

  // 倒计时效果
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // 时间到了，自动提交
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
    // 对于文件上传，我们将文件名存储在答案中
    setAnswers((prev) => ({
      ...prev,
      [questionId]: file.name,
    }));
  };

  const handleSubmit = async () => {
    if (submitting || !assignment) return;

    try {
      setSubmitting(true);

      // 准备提交数据
      const submissionData = {
        answers:
          assignment.questions?.map((question, index) => {
            const questionId =
              question.id || question.title || `question-${index}`;
            return {
              questionId: questionId,
              answer: answers[questionId] || null,
            };
          }) || [],
        submittedAt: new Date().toISOString(),
      };

      // 调用提交 API
      const response = await fetch(
        `/api/courses/${assignment.course}/assessments/${assignmentId}/submissions`,
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (
    question: NonNullable<Assignment['questions']>[number],
    index: number
  ) => {
    const questionId = question.id || question.title || `question-${index}`;
    const currentAnswer = answers[questionId];

    return (
      <div
        key={questionId}
        className="mb-8 p-6 border border-gray-200 rounded-lg"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Question {index + 1}: {question.question || question.title}
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {question.points} points
          </span>
        </div>

        {question.type === 'multiple-choice' && (
          <div className="space-y-2">
            {question.options?.map((option, optIndex) => (
              <label key={optIndex} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={questionId}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) =>
                    handleAnswerChange(questionId, e.target.value)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'true-false' && (
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name={questionId}
                value="true"
                checked={currentAnswer === 'true'}
                onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">True</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name={questionId}
                value="false"
                checked={currentAnswer === 'false'}
                onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">False</span>
            </label>
          </div>
        )}

        {(question.type === 'short-answer' || question.type === 'essay') && (
          <div>
            <textarea
              value={(currentAnswer as string) || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              placeholder="Enter your answer..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={question.type === 'essay' ? 8 : 3}
            />
          </div>
        )}

        {question.type === 'coding' && (
          <div>
            <textarea
              value={(currentAnswer as string) || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              placeholder="Write your code here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
              rows={10}
            />
            {question.testCases && question.testCases.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Test Cases:</h4>
                <div className="space-y-2">
                  {question.testCases.map((testCase, tcIndex) => (
                    <div
                      key={tcIndex}
                      className="bg-gray-50 p-3 rounded text-sm"
                    >
                      <div>
                        <strong>Input:</strong> {testCase.input}
                      </div>
                      <div>
                        <strong>Expected Output:</strong> {testCase.output}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {question.type === 'file-upload' && (
          <div>
            <input
              type="file"
              accept={question.fileType || '*/*'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // 检查文件大小
                  if (
                    question.maxFileSize &&
                    file.size > question.maxFileSize
                  ) {
                    alert(
                      `File size exceeds maximum allowed size of ${(question.maxFileSize / 1024 / 1024).toFixed(1)}MB`
                    );
                    return;
                  }
                  handleFileUpload(questionId, file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {question.maxFileSize && (
              <p className="text-sm text-gray-500 mt-1">
                Maximum file size:{' '}
                {(question.maxFileSize / 1024 / 1024).toFixed(1)}MB
              </p>
            )}
            {uploadedFiles[questionId] && (
              <p className="text-sm text-green-600 mt-2">
                Uploaded: {uploadedFiles[questionId].name}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

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
  const answeredQuestions = Object.keys(answers).length;
  const isComplete = answeredQuestions === totalQuestions;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link
                href="/dashboard/assignments"
                className="text-blue-600 hover:underline mb-2 inline-block"
              >
                ← Back to All Assignments
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assignment.title}
              </h1>
              <p className="text-gray-600 mb-4">{assignment.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {assignment.dueDate && (
                  <span>
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                )}
                <span>
                  Total Points:{' '}
                  {assignment.totalPoints || assignment.points || 0}
                </span>
                <span>Questions: {totalQuestions}</span>
                {assignment.timeLimit && assignment.timeLimit > 0 && (
                  <span>Time Limit: {assignment.timeLimit} minutes</span>
                )}
              </div>
            </div>

            {timeRemaining !== null && timeRemaining > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-yellow-800 font-medium">
                  Time Remaining
                </div>
                <div className="text-2xl font-bold text-yellow-900">
                  {formatTime(timeRemaining)}
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Progress: {answeredQuestions} / {totalQuestions} questions
              completed
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {assignment.questions?.map((question, index) =>
            renderQuestion(question, index)
          )}
        </div>

        {/* Submit Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">
                {answeredQuestions} of {totalQuestions} questions answered
              </div>
              {!isComplete && (
                <div className="text-sm text-yellow-600">
                  Please answer all questions before submitting
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Link
                href="/dashboard/assignments"
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Assignments
              </Link>

              <button
                onClick={handleSubmit}
                disabled={!isComplete || submitting || timeRemaining === 0}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  isComplete && !submitting && timeRemaining !== 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
