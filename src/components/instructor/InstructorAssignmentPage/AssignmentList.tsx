'use client';

import React from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { Assignment } from '@/types/assignment';

interface AssignmentListProps {
  assignments: Assignment[];
  selectedAssignmentId: string | null;
  onSelectAssignment: (assignment: Assignment) => void;
  courseId: string;
  onDeleteAssignment: (assignmentId: string) => void;
}

export default function AssignmentList({
  assignments,
  selectedAssignmentId,
  onSelectAssignment,
  courseId,
  onDeleteAssignment,
}: AssignmentListProps) {
  return (
    <div className="h-full border-r border-gray-200 bg-gray-50 overflow-y-auto">
      {/* Header with navigation and actions */}
      <div className="p-4 border-b bg-white">
        {/* Course navigation */}
        <div className="mb-3">
          <Link
            href="/instructor/courses"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Courses
          </Link>
        </div>

        {/* Assignment management */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Assignments</h2>
          <Link href={`/instructor/courses/${courseId}/assignments/create`}>
            <button className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700">
              ➕ New Assignment
            </button>
          </Link>
        </div>

        {/* Course content navigation */}
        <div className="flex space-x-4 text-sm">
          <Link
            href={`/instructor/courses/${courseId}/modules`}
            className="text-gray-600 hover:text-blue-600 transition-colors pb-1"
          >
            📚 Modules
          </Link>
          <span className="font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
            📋 Assignments
          </span>
        </div>
      </div>

      {/* Assignment list */}
      <div className="px-4 pt-4 pb-12">
        {assignments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="mb-4">No assignments created yet.</p>
            <Link href={`/instructor/courses/${courseId}/assignments/create`}>
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700">
                Create Your First Assignment
              </button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className={clsx(
                  'p-4 border border-gray-200 rounded-md shadow-sm bg-white cursor-pointer transition-colors hover:bg-gray-50',
                  selectedAssignmentId === assignment.id &&
                    '!border-blue-500 bg-blue-50'
                )}
                onClick={() => onSelectAssignment(assignment)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {assignment.title}
                    </h3>
                    <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            assignment.description.substring(0, 100) +
                            (assignment.description.length > 100 ? '...' : ''),
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>
                        📅{' '}
                        {assignment.dueDate
                          ? new Date(assignment.dueDate).toLocaleDateString()
                          : 'No due date'}
                      </span>
                      <span>📊 {assignment.points || 0} points</span>
                      {assignment.timeLimit && assignment.timeLimit > 0 && (
                        <span>⏱️ {assignment.timeLimit} mins</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Link
                      href={`/instructor/courses/${courseId}/assignments/${assignment.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="p-1 text-yellow-600 hover:bg-yellow-100 rounded text-sm"
                        title="Edit Assignment"
                      >
                        ✏️
                      </button>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            'Are you sure you want to delete this assignment?'
                          )
                        ) {
                          onDeleteAssignment(assignment.id);
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded text-sm"
                      title="Delete Assignment"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
