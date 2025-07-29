'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { assignmentService } from '@/lib/assignmentService';
import { AssignmentStatsCards, AssignmentCard } from '@/components/assignment/Dashboard';
import { AssignmentOverview } from '@/types/assignment';

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

     
      const uniqueCourseIds = [...new Set(
        assignments
          .filter(assignment => assignment.course || assignment.courseId)
          .map(assignment => assignment.course || assignment.courseId!)
      )];

      const coursePromises = uniqueCourseIds.map((courseId) => {
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

        <AssignmentStatsCards 
          stats={{
            pending: pendingAssignments.length,
            overdue: overdueAssignments.length,
            submitted: submittedAssignments.length,
            graded: gradedAssignments.length
          }} 
        />

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
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
