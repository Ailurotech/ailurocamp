'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { assignmentService } from '@/lib/assignmentService';

interface AssignmentOverview {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  dueDate?: string;
  points: number;
  isSubmitted?: boolean;
  submissionScore?: number;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
}

export default function DashboardAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const fetchAllAssignments = React.useCallback(async () => {
    try {
      setLoading(true);
      const studentId = session?.user?.id || 'student-1';

      const assignments = await assignmentService.getAssignments();

      const coursePromises = assignments.map((assignment) => {
        const courseId = assignment.course || assignment.courseId!;
        return assignmentService.getCourseById(courseId);
      });
      const courses = await Promise.all(coursePromises);
      const courseMap = new Map(
        courses.filter((c) => c).map((c) => [c!._id, c!])
      );

      const assignmentsWithStatus: AssignmentOverview[] = assignments
        .filter((assignment) => assignment.course || assignment.courseId)
        .map((assignment) => {
          const courseId = assignment.course || assignment.courseId!;
          const course = courseMap.get(courseId);
          const now = new Date();
          const dueDate = assignment.dueDate
            ? new Date(assignment.dueDate)
            : null;

          const submission = assignment.submissions?.find(
            (sub) => sub.student.toString() === studentId
          );

          let status: 'pending' | 'submitted' | 'graded' | 'overdue';
          const isSubmitted = !!submission;
          const submissionScore = submission?.score;

          if (submission) {
            if (submission.score !== undefined && submission.gradedAt) {
              status = 'graded';
            } else {
              status = 'submitted';
            }
          } else {
            if (dueDate && now > dueDate) {
              status = 'overdue';
            } else {
              status = 'pending';
            }
          }

          return {
            id: assignment._id || assignment.id!,
            title: assignment.title,
            courseId: assignment.course || assignment.courseId!,
            courseTitle: course?.title || 'Unknown Course',
            dueDate: assignment.dueDate
              ? typeof assignment.dueDate === 'string'
                ? assignment.dueDate
                : assignment.dueDate.toISOString()
              : undefined,
            points: assignment.totalPoints || assignment.points!,
            isSubmitted,
            submissionScore,
            status,
          };
        });

      setAssignments(assignmentsWithStatus);
    } catch (err) {
      setError('Failed to fetch assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

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

    fetchAllAssignments();
  }, [session, sessionStatus, router, fetchAllAssignments]);

  const getStatusBadge = (assignment: AssignmentOverview) => {
    switch (assignment.status) {
      case 'graded':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Graded ({assignment.submissionScore}/{assignment.points})
          </span>
        );
      case 'submitted':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Submitted
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Overdue
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Pending
          </span>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'border-l-green-500';
      case 'submitted':
        return 'border-l-yellow-500';
      case 'overdue':
        return 'border-l-red-500';
      case 'pending':
      default:
        return 'border-l-blue-500';
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingAssignments = assignments.filter((a) => a.status === 'pending');
  const overdueAssignments = assignments.filter((a) => a.status === 'overdue');
  const submittedAssignments = assignments.filter(
    (a) => a.status === 'submitted'
  );
  const gradedAssignments = assignments.filter((a) => a.status === 'graded');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 All Assignments
          </h1>
          <p className="text-gray-600">
            Overview of all your assignments across all courses
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pendingAssignments.length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {overdueAssignments.length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {submittedAssignments.length}
            </div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {gradedAssignments.length}
            </div>
            <div className="text-sm text-gray-600">Graded</div>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-lg mb-2">No assignments found</p>
              <p className="text-sm">You don&apos;t have any assignments yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${getStatusColor(assignment.status)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      {getStatusBadge(assignment)}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      📚 {assignment.courseTitle}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📊 {assignment.points} points</span>
                      {assignment.dueDate && (
                        <span>
                          📅 Due:{' '}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {assignment.status === 'overdue' &&
                    !assignment.isSubmitted ? (
                      <div className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed text-sm">
                        Assignment Overdue
                      </div>
                    ) : (
                      <Link
                        href={
                          assignment.isSubmitted
                            ? `/dashboard/assignments/${assignment.id}/submission`
                            : `/dashboard/assignments/${assignment.id}`
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        {assignment.isSubmitted
                          ? 'View Submission'
                          : 'Start Assignment'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
