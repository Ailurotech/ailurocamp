'use client';

import React, { useEffect, useState } from 'react';
import { Assignment, AssignmentApiResponse } from '@/types/assignment';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';
import AssignmentForm from '@/components/assignment/AssignmentForm';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/Loading';
import PopupModal, { PopupProps } from '@/components/ui/PopupModal';

export default function EditAssignmentPage({
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
  }, [session, sessionStatus, router]);  const fetchAssignment = async () => {
    setLoading(true);
    try {      const result = await adapter.getAssignment(courseId, assignmentId);
      // 检查返回的格式是否包含 assignment 属性
      let apiResponse: AssignmentApiResponse;
      if ('assignment' in result) {
        apiResponse = result.assignment as AssignmentApiResponse;
      } else {
        apiResponse = result as AssignmentApiResponse;
      }
      
      const converted: Assignment = {
        id: apiResponse.id,
        title: apiResponse.title,
        description: apiResponse.description,
        courseId: courseId,
        dueDate: apiResponse.dueDate || '',
        points: apiResponse.points,
        questions: apiResponse.questions ? apiResponse.questions.map(q => ({
          id: Date.now().toString() + Math.random(),
          title: q.question,
          type: q.type as 'multiple-choice' | 'coding' | 'file-upload' | 'essay',
          points: q.points,
          options: q.options,
          choices: q.options?.map(opt => ({ value: opt, label: opt })) || []
        })) : [],
        timeLimit: 0,
        passingScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAssignment(converted);
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
        <div className="mb-4">
          <Link 
            href={`/instructor/courses/${courseId}/assignments/${assignmentId}`}
            className="text-blue-600 hover:underline"
          >
            ← Back to Assignment Details
          </Link>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          ✏️ Edit Assignment
        </h1>

        {/* Assignment Form */}
        <AssignmentForm
          courseId={courseId}
          defaultValues={assignment}
          onSubmit={async () => {
            // 表单已经处理了API调用，这里只需要导航
            router.push(`/instructor/courses/${courseId}/assignments/${assignmentId}`);
          }}
        />
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
