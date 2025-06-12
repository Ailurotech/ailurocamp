'use client';

import React, { useEffect, useState } from 'react';
import { Assignment, AssignmentApiResponse } from '@/types/assignment';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/Loading';
import PopupModal, { PopupProps } from '@/components/ui/PopupModal';

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>;
}) {
  const { id: courseId, assignmentId } = React.use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<PopupProps | null>(null);
  const adapter = new AssignmentApiAdapter();

  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.currentRole !== 'instructor') {
      router.push('/');
      return;
    }
  }, [session, sessionStatus, router]);

  const fetchAssignment = async () => {
    setLoading(true);
    try {
      const result = await adapter.getAssignment(courseId, assignmentId);
      if ('assignment' in result) {
        const apiResponse = result.assignment as AssignmentApiResponse;
        const converted: Assignment = {
          id: apiResponse.id,
          title: apiResponse.title,
          description: apiResponse.description,
          dueDate: apiResponse.dueDate,
          points: apiResponse.points,
          questions: apiResponse.questions
            ? apiResponse.questions.map((q) => ({
                id: Date.now().toString() + Math.random(),
                title: q.question,
                question: q.question,
                type: q.type as
                  | 'multiple-choice'
                  | 'coding'
                  | 'file-upload'
                  | 'essay',
                points: q.points,
                options: q.options,
                choices:
                  q.options?.map((opt) => ({ value: opt, label: opt })) || [],
                testCases: q.testCases,
                fileType: q.fileType,
                maxFileSize: q.maxFileSize,
                correctAnswer: q.correctAnswer,
              }))
            : [],
          timeLimit: 0,
          passingScore: 0,
          courseId: courseId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setAssignment(converted);
      } else {
        throw new Error('Assignment not found');
      }
    } catch (error) {
      console.error('Failed to fetch assignment:', error);
      setPopup({
        message: 'Failed to fetch assignment details. Please try again.',
        type: 'error',
        onClose: () => setPopup(null),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      const result = await adapter.deleteAssignment(courseId, assignmentId);
      if (result.success) {
        setPopup({
          message: 'Assignment deleted successfully!',
          type: 'success',
          onClose: () => {
            setPopup(null);
            router.push(`/instructor/courses/${courseId}/assignments`);
          },
        });
      } else {
        throw new Error('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      setPopup({
        message: 'Failed to delete assignment. Please try again.',
        type: 'error',
        onClose: () => setPopup(null),
      });
    }
  };

  useEffect(() => {
    if (
      sessionStatus !== 'loading' &&
      session?.user.currentRole === 'instructor'
    ) {
      fetchAssignment();
    }
  }, [courseId, assignmentId, session, sessionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  if (sessionStatus === 'loading' || loading) {
    return <Loading />;
  }
  if (!session || session.user.currentRole !== 'instructor') {
    return null;
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Assignment not found.</p>
            <Link
              href={`/instructor/courses/${courseId}/assignments`}
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              ← Back to Assignments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href={`/instructor/courses/${courseId}/assignments`}
            className="text-blue-600 hover:underline"
          >
            ← Back to Assignments
          </Link>
        </div>

        {/* Header with Actions */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            📋 Assignment Details
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/instructor/courses/${courseId}/assignments/${assignmentId}/edit`}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to delete this assignment? This action cannot be undone.'
                  )
                ) {
                  handleDeleteAssignment();
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Assignment Content */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {assignment.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-3 rounded">
                <div className="text-sm text-gray-500">Points</div>
                <div className="text-lg font-semibold">
                  {assignment.points || 0}
                </div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-sm text-gray-500">Due Date</div>
                <div className="text-lg font-semibold">
                  {assignment.dueDate
                    ? new Date(assignment.dueDate).toLocaleDateString()
                    : 'No due date'}
                </div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-sm text-gray-500">Time Limit</div>
                <div className="text-lg font-semibold">
                  {assignment.timeLimit || 0} mins
                </div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-sm text-gray-500">Passing Score</div>
                <div className="text-lg font-semibold">
                  {assignment.passingScore || 0}%
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Description
              </h3>
              <div
                className="bg-white p-4 rounded border prose max-w-none"
                dangerouslySetInnerHTML={{ __html: assignment.description }}
              />
            </div>
          </div>{' '}
          {/* Questions Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Questions
            </h3>
            {assignment.questions && assignment.questions.length > 0 ? (
              <div className="space-y-6">
                {assignment.questions.map((question, index) => {
                  const questionType = question.type;

                  return (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-lg border shadow-sm"
                    >
                      {/* Question Header */}
                      <div className="border-b border-gray-200 pb-3 mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">
                            Question {index + 1}
                          </h4>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {questionType}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {question.points} pts
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-700 leading-relaxed">
                          {question.title}
                        </div>
                      </div>

                      {/* Question Details */}
                      <div className="space-y-4">
                        {' '}
                        {/* Multiple Choice Options */}
                        {questionType === 'multiple-choice' &&
                          question.options &&
                          question.options.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-2">
                                Answer Options:
                              </div>
                              <ul className="space-y-1">
                                {question.options.map((option, optionIndex) => (
                                  <li
                                    key={optionIndex}
                                    className="flex items-center"
                                  >
                                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    <span className="text-gray-700">
                                      {typeof option === 'string'
                                        ? option
                                        : String(option)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              {question.correctAnswer && (
                                <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                  <span className="text-sm font-medium text-green-700">
                                    Correct Answer:{' '}
                                  </span>
                                  <span className="text-green-800">
                                    {question.correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        {/* True/False Questions */}
                        {questionType === 'true-false' && (
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-2">
                              Answer Options:
                            </div>
                            <ul className="space-y-1">
                              <li className="flex items-center">
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                  A
                                </span>
                                <span className="text-gray-700">True</span>
                              </li>
                              <li className="flex items-center">
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                  B
                                </span>
                                <span className="text-gray-700">False</span>
                              </li>
                            </ul>
                            {question.correctAnswer && (
                              <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                <span className="text-sm font-medium text-green-700">
                                  Correct Answer:{' '}
                                </span>
                                <span className="text-green-800">
                                  {question.correctAnswer}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Short Answer Questions */}
                        {questionType === 'short-answer' && (
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-2">
                              Answer Type:
                            </div>
                            <div className="text-gray-700">
                              Short text response
                            </div>
                            {question.placeholder && (
                              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                <div className="text-sm font-medium text-blue-700 mb-1">
                                  Instructions:
                                </div>
                                <div className="text-blue-800 text-sm">
                                  {question.placeholder}
                                </div>
                              </div>
                            )}
                            {question.correctAnswer && (
                              <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                <span className="text-sm font-medium text-green-700">
                                  Expected Answer:{' '}
                                </span>
                                <span className="text-green-800">
                                  {question.correctAnswer}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Coding Question Test Cases */}
                        {questionType === 'coding' &&
                          question.testCases &&
                          question.testCases.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-3">
                                Test Cases:
                              </div>
                              <div className="space-y-3">
                                {question.testCases.map(
                                  (testCase, testIndex) => (
                                    <div
                                      key={testIndex}
                                      className="bg-gray-50 p-4 rounded border"
                                    >
                                      <div className="text-xs font-medium text-gray-500 mb-2">
                                        Test Case {testIndex + 1}
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <div className="text-sm font-medium text-gray-600 mb-1">
                                            Input:
                                          </div>
                                          <div className="bg-white p-2 rounded border font-mono text-sm">
                                            {testCase.input || 'No input'}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-gray-600 mb-1">
                                            Expected Output:
                                          </div>
                                          <div className="bg-white p-2 rounded border font-mono text-sm">
                                            {testCase.output || 'No output'}
                                          </div>
                                        </div>
                                      </div>{' '}
                                      {testCase.file && (
                                        <div className="mt-3">
                                          <div className="text-sm font-medium text-gray-600 mb-1">
                                            Test File:
                                          </div>{' '}
                                          {typeof testCase.file === 'object' &&
                                          'url' in testCase.file ? (
                                            <div>
                                              <a
                                                href={testCase.file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline font-mono text-sm"
                                              >
                                                {testCase.file.name}
                                              </a>
                                              {testCase.file.size && (
                                                <span className="text-xs text-gray-500 ml-2">
                                                  (
                                                  {Math.round(
                                                    testCase.file.size / 1024
                                                  )}{' '}
                                                  KB)
                                                </span>
                                              )}
                                            </div>
                                          ) : typeof testCase.file ===
                                            'string' ? (
                                            testCase.file.startsWith(
                                              '/uploads/'
                                            ) ? (
                                              <a
                                                href={testCase.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline font-mono text-sm"
                                              >
                                                {testCase.file.split('/').pop()}
                                              </a>
                                            ) : (
                                              <div className="text-blue-600 font-mono text-sm">
                                                {testCase.file}
                                              </div>
                                            )
                                          ) : (
                                            <div className="text-blue-600 font-mono text-sm">
                                              {String(testCase.file)}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {/* File Upload Configuration */}
                        {questionType === 'file-upload' && (
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-3">
                              File Upload Settings:
                            </div>
                            <div className="bg-gray-50 p-4 rounded border">
                              {question.fileType && (
                                <div className="mb-3">
                                  <span className="text-sm font-medium text-gray-600">
                                    Allowed File Types:
                                  </span>
                                  <div className="mt-1 text-gray-700">
                                    {question.fileType}
                                  </div>
                                </div>
                              )}
                              {question.maxFileSize && (
                                <div>
                                  <span className="text-sm font-medium text-gray-600">
                                    Maximum File Size:
                                  </span>
                                  <div className="mt-1 text-gray-700">
                                    {Math.round(
                                      question.maxFileSize / (1024 * 1024)
                                    )}{' '}
                                    MB
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Essay Questions */}
                        {questionType === 'essay' && (
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-2">
                              Answer Type:
                            </div>
                            <div className="text-gray-700">
                              Long form essay response
                            </div>
                            {question.placeholder && (
                              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                <div className="text-sm font-medium text-blue-700 mb-1">
                                  Instructions:
                                </div>
                                <div className="text-blue-800 text-sm">
                                  {question.placeholder}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No questions added yet.</p>
              </div>
            )}
          </div>
          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Assignment ID:</span>
                <span className="ml-2 font-mono">{assignment.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Course ID:</span>
                <span className="ml-2 font-mono">{courseId}</span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2">
                  {new Date(assignment.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <span className="ml-2">
                  {new Date(assignment.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>{' '}
      {/* Popup Modal */}
      {popup && (
        <PopupModal
          message={popup.message}
          type={popup.type}
          onClose={popup.onClose}
        />
      )}
    </div>
  );
}
