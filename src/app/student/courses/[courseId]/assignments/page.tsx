'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Assignment } from '@/types/assignment';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';
// import Loading from '@/components/Loading'; // 暂时注释掉，需要确认组件路径

interface AssignmentWithSubmission extends Assignment {
  isSubmitted?: boolean;
  submissionScore?: number;
  submittedAt?: string;
  gradedAt?: string;
}

export default function StudentAssignmentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const courseId = React.use(params).courseId;
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const adapter = React.useMemo(() => new AssignmentApiAdapter(), []);

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

    fetchAssignments();
  }, [session, sessionStatus, router, courseId]);

  const fetchAssignments = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await adapter.getAssignments(courseId);
      
      if ('assignments' in result) {
        // 转换为学生端格式，并检查提交状态
        const assignmentsWithSubmissions = await Promise.all(
          result.assignments.map(async (item) => {
            // 检查是否已提交
            let isSubmitted = false;
            let submissionScore: number | undefined;
            let submittedAt: string | undefined;
            let gradedAt: string | undefined;
            
            try {
              const submission = await adapter.getSubmission(courseId, item.id);
              isSubmitted = true;
              submissionScore = submission.score;
              submittedAt = submission.submittedAt;
              gradedAt = submission.gradedAt;
            } catch {
              // 没有提交记录，保持默认值
            }
            
            return {
              id: item.id,
              title: item.title,
              description: item.description,
              dueDate: item.dueDate,
              points: item.points,
              timeLimit: 0,
              passingScore: 0,
              courseId: courseId,
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
              questions: item.questions ? item.questions.map((q, index) => ({
                id: `${Date.now()}-${index}`,
                title: q.question,
                type: q.type as 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload',
                points: q.points,
                options: q.options,
                correctAnswer: q.correctAnswer,
                testCases: q.testCases,
                fileType: q.fileType,
                maxFileSize: q.maxFileSize,
              })) : [],
              isSubmitted,
              submissionScore,
              submittedAt,
              gradedAt,
            };
          })
        );
        
        setAssignments(assignmentsWithSubmissions);
      }
    } catch (err) {
      setError('Failed to fetch assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, adapter]);

  const getStatusBadge = (assignment: AssignmentWithSubmission) => {
    const now = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    
    if (assignment.isSubmitted) {
      if (assignment.submissionScore !== undefined) {
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Graded ({assignment.submissionScore}/{assignment.points})
          </span>
        );
      }
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          Submitted
        </span>
      );
    }
    
    if (dueDate && now > dueDate) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          Overdue
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
        Pending
      </span>
    );
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/student/courses/${courseId}`}
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Assignments
          </h1>
          <p className="text-gray-600">
            Complete your assignments and track your progress
          </p>
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-lg mb-2">No assignments yet</p>
              <p className="text-sm">Check back later for new assignments</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>📊 {assignment.points} points</span>
                      {assignment.dueDate && (
                        <span>
                          📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {assignment.timeLimit && assignment.timeLimit > 0 && (
                        <span>⏱️ {assignment.timeLimit} minutes</span>
                      )}
                    </div>
                    <div 
                      className="text-gray-700 text-sm line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: assignment.description.substring(0, 200) + 
                               (assignment.description.length > 200 ? '...' : '')
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(assignment)}
                    <Link 
                      href={
                        assignment.isSubmitted 
                          ? `/student/courses/${courseId}/assignments/${assignment.id}/submission`
                          : `/student/courses/${courseId}/assignments/${assignment.id}`
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      {assignment.isSubmitted ? 'View Submission' : 'Start Assignment'}
                    </Link>
                  </div>
                </div>
                
                {/* Assignment Stats */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Questions:</span>
                      <span className="ml-2 font-medium">
                        {assignment.questions?.length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium">
                        {assignment.isSubmitted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    {assignment.submittedAt && (
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <span className="ml-2 font-medium">
                          {new Date(assignment.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {assignment.gradedAt && (
                      <div>
                        <span className="text-gray-500">Graded:</span>
                        <span className="ml-2 font-medium">
                          {new Date(assignment.gradedAt).toLocaleDateString()}
                        </span>
                      </div>
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
