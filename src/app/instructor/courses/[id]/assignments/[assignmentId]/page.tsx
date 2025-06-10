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

  // Session and authentication
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  // Check if user is authenticated and is an instructor
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
      const result = await adapter.getAssignment(courseId, assignmentId);      if ('assignment' in result) {
        // 转换API响应为Assignment类型
        const apiResponse = result.assignment as AssignmentApiResponse;
        const converted: Assignment = {
          id: apiResponse.id,
          title: apiResponse.title,
          description: apiResponse.description,
          dueDate: apiResponse.dueDate,
          points: apiResponse.points,
          questions: [],
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
      console.error('Failed to fetch assignment:', error);      setPopup({
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
      if (result.success) {        setPopup({
          message: 'Assignment deleted successfully!',
          type: 'success',
          onClose: () => {
            setPopup(null);
            router.push(`/instructor/courses/${courseId}/assignments`);
          },
        });      } else {
        throw new Error('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error);      setPopup({
        message: 'Failed to delete assignment. Please try again.',
        type: 'error',
        onClose: () => setPopup(null),
      });
    }
  };

  useEffect(() => {
    if (sessionStatus !== 'loading' && session?.user.currentRole === 'instructor') {
      fetchAssignment();
    }
  }, [courseId, assignmentId, session, sessionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  if (sessionStatus === 'loading' || loading) {
    return <Loading />;
  }

  if (!session || session.user.currentRole !== 'instructor') {
    return null; // 重定向已在 useEffect 中处理
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
                if (window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
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
                <div className="text-lg font-semibold">{assignment.points || 0}</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-sm text-gray-500">Due Date</div>
                <div className="text-lg font-semibold">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                </div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-sm text-gray-500">Time Limit</div>
                <div className="text-lg font-semibold">{assignment.timeLimit || 0} mins</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="text-sm text-gray-500">Passing Score</div>
                <div className="text-lg font-semibold">{assignment.passingScore || 0}%</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
              <div 
                className="bg-white p-4 rounded border prose max-w-none"
                dangerouslySetInnerHTML={{ __html: assignment.description }}
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Questions</h3>
            {assignment.questions && assignment.questions.length > 0 ? (
              <div className="space-y-4">
                {assignment.questions.map((question, index) => (
                  <div key={index} className="bg-white p-4 rounded border">                    <div className="font-medium text-gray-800 mb-2">
                      Question {index + 1}: {question.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      Type: {question.type} | Points: {question.points}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No questions added yet.</p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Metadata</h3>
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
                <span className="ml-2">{new Date(assignment.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <span className="ml-2">{new Date(assignment.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Popup Modal */}
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
