import React from 'react';
import Link from 'next/link';
import { AssignmentOverview } from '@/types/assignment';

interface AssignmentCardProps {
  assignment: AssignmentOverview;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
}) => {
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

  return (
    <div
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
                📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {assignment.status === 'overdue' && !assignment.isSubmitted ? (
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
              {assignment.isSubmitted ? 'View Submission' : 'Start Assignment'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
