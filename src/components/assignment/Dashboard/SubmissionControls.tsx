import React from 'react';
import Link from 'next/link';

interface SubmissionControlsProps {
  answeredQuestions: number;
  totalQuestions: number;
  isComplete: boolean;
  submitting: boolean;
  timeRemaining: number | null;
  onSubmit: () => void;
}

export default function SubmissionControls({
  answeredQuestions,
  totalQuestions,
  isComplete,
  submitting,
  timeRemaining,
  onSubmit,
}: SubmissionControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-600 mb-1">
            {answeredQuestions} of {totalQuestions} questions answered
          </div>
          {!isComplete && (
            <div className="text-sm text-yellow-600">
              Please answer all questions before submitting
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard/assignments"
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Assignments
          </Link>

          <button
            onClick={onSubmit}
            disabled={!isComplete || submitting || timeRemaining === 0}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isComplete && !submitting && timeRemaining !== 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}
