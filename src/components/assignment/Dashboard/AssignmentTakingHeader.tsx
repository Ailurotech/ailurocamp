import React from 'react';
import Link from 'next/link';
import { Assignment } from '@/types/assignment';

interface AssignmentTakingHeaderProps {
  assignment: Assignment;
  timeRemaining: number | null;
  answeredQuestions: number;
  totalQuestions: number;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function AssignmentTakingHeader({
  assignment,
  timeRemaining,
  answeredQuestions,
  totalQuestions,
}: AssignmentTakingHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link
            href="/dashboard/assignments"
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to All Assignments
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {assignment.title}
          </h1>
          <p className="text-gray-600 mb-4">{assignment.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {assignment.dueDate && (
              <span>
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            )}
            <span>
              Total Points: {assignment.totalPoints || assignment.points || 0}
            </span>
            <span>Questions: {totalQuestions}</span>
            {assignment.timeLimit && assignment.timeLimit > 0 && (
              <span>Time Limit: {assignment.timeLimit} minutes</span>
            )}
          </div>
        </div>

        {timeRemaining !== null && timeRemaining > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800 font-medium">Time Remaining</div>
            <div className="text-2xl font-bold text-yellow-900">
              {formatTime(timeRemaining)}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Progress: {answeredQuestions} / {totalQuestions} questions completed
        </div>
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
