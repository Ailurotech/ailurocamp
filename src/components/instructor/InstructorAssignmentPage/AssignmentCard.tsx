'use client';

import React from 'react';
import Link from 'next/link';
import { Assignment } from '@/types/assignment';

interface AssignmentCardProps {
  assignment: Assignment | null;
  courseId: string;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  isDeleting?: boolean;
}

export default function AssignmentCard({
  assignment,
  courseId,
  onEdit,
  onDelete,
  isDeleting = false,
}: AssignmentCardProps) {
  if (!assignment) {
    return (
      <div className="h-full bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-lg mb-2">Select an Assignment</p>
          <p className="text-sm">Choose an assignment from the list to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {assignment.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📅 Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</span>
              <span>📊 Points: {assignment.points || 0}</span>
              {assignment.timeLimit && assignment.timeLimit > 0 && (
                <span>⏱️ Time Limit: {assignment.timeLimit} mins</span>
              )}
              {assignment.passingScore && assignment.passingScore > 0 && (
                <span>✅ Passing: {assignment.passingScore}%</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(assignment)}
              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(assignment)}
              disabled={isDeleting}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? '🔄' : '🗑️'} Delete
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
          <div 
            className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg"
            dangerouslySetInnerHTML={{ __html: assignment.description }}
          />
        </div>        {/* Questions Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Questions</h2>
          {assignment.questions && assignment.questions.length > 0 ? (
            <div className="space-y-3">
              {assignment.questions.map((question, index) => {
                // 处理不同的数据结构
                const questionData = question as Record<string, unknown>;
                const questionText = (questionData.question as string) || (questionData.title as string) || 'No question text';
                const questionPoints = (questionData.points as number) || 0;
                const questionType = questionData.type as string;
                const options = (questionData.options as string[]) || (questionData.choices as Array<{label: string}>);
                
                return (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800">Question {index + 1}</span>
                      <span className="text-sm text-gray-600">{questionPoints} points</span>
                    </div>
                    <p className="text-gray-700 mb-2">{questionText}</p>
                    <div className="text-sm text-gray-500">
                      Type: <span className="font-medium">{questionType}</span>
                    </div>
                    {options && options.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-500 mb-1">Options:</div>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {options.map((option, optionIndex) => (
                            <li key={optionIndex}>
                              {typeof option === 'string' ? option : (option as {label: string}).label || String(option)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
              <p>No questions added yet.</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Assignment ID:</span>
              <span className="ml-2 font-mono text-gray-700">{assignment.id}</span>
            </div>
            <div>
              <span className="text-gray-500">Course ID:</span>
              <span className="ml-2 font-mono text-gray-700">{courseId}</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-2 text-gray-700">
                {new Date(assignment.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Updated:</span>
              <span className="ml-2 text-gray-700">
                {new Date(assignment.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <Link 
            href={`/instructor/courses/${courseId}/assignments/${assignment.id}`}
            className="flex-1"
          >
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              🔍 View Full Details
            </button>
          </Link>
          <Link 
            href={`/instructor/courses/${courseId}/assignments/${assignment.id}/edit`}
            className="flex-1"
          >
            <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
              ✏️ Edit Assignment
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
