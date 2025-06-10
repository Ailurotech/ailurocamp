'use client';

import React, { useEffect, useState } from 'react';
import { Assignment } from '@/types/assignment';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';
import AssignmentList from '@/components/instructor/InstructorAssignmentPage/AssignmentList';
import AssignmentCard from '@/components/instructor/InstructorAssignmentPage/AssignmentCard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/Loading';
import PopupModal, { PopupProps } from '@/components/ui/PopupModal';

export default function InstructorAssignmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const courseId: string = React.use(params).id;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
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

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const result = await adapter.getAssignments(courseId);
      if ('assignments' in result) {
        // 新API返回格式，需要转换为 Assignment 类型
        const converted = result.assignments.map(item => ({
          ...item,
          questions: [],
          timeLimit: 0,
          passingScore: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })) as Assignment[];
        setAssignments(converted);
      } else {
        // 旧API返回格式
        setAssignments(result as Assignment[]);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);      setPopup({
        message: 'Failed to fetch assignments. Please try again.',
        type: 'error',
        onClose: () => setPopup(null),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const result = await adapter.deleteAssignment(courseId, assignmentId);      if (result.success) {
        setPopup({
          message: 'Assignment deleted successfully!',
          type: 'success',
          onClose: () => setPopup(null),
        });
        // 如果删除的是当前选中的作业，清除选择
        if (selectedAssignment?.id === assignmentId) {
          setSelectedAssignment(null);
        }
        fetchAssignments(); // 刷新列表
      } else {
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

  const handleEditAssignment = (assignment: Assignment) => {
    router.push(`/instructor/courses/${courseId}/assignments/${assignment.id}/edit`);
  };

  const handleDeleteFromCard = (assignment: Assignment) => {
    if (window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      handleDeleteAssignment(assignment.id);
    }
  };

  useEffect(() => {
    if (sessionStatus !== 'loading' && session?.user.currentRole === 'instructor') {
      fetchAssignments();
    }
  }, [courseId, session, sessionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  if (sessionStatus === 'loading' || loading) {
    return <Loading />;
  }

  if (!session || session.user.currentRole !== 'instructor') {
    return null; // 重定向已在 useEffect 中处理
  }

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Assignment List */}
      <div className="w-1/2">
        <AssignmentList
          assignments={assignments}
          selectedAssignmentId={selectedAssignment?.id || null}
          onSelectAssignment={setSelectedAssignment}
          courseId={courseId}
          onDeleteAssignment={handleDeleteAssignment}
        />
      </div>

      {/* Assignment Details Card */}
      <div className="w-1/2">
        <AssignmentCard
          assignment={selectedAssignment}
          courseId={courseId}
          onEdit={handleEditAssignment}
          onDelete={handleDeleteFromCard}
        />
      </div>      {/* Popup Modal */}
      {popup && (
        <PopupModal
          message={popup.message}
          type={popup.type}
          onClose={popup.onClose}
        />
      )}
    </main>
  );
}
