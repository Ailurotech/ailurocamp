'use client';

import React from 'react';

interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment';
  totalPoints: number;
  submission?: {
    score?: number;
    submittedAt: string;
    gradedAt?: string;
  };
}

interface AssessmentProgressProps {
  assessments: Assessment[];
  formatDate: (dateString?: string) => string;
}

const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  assessments,
  formatDate,
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {assessments.map((assessment) => (
          <li key={assessment.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    {assessment.submission ? (
                      <svg
                        className="text-green-500 h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="text-gray-400 h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {assessment.title}
                      </div>
                      <div className="text-xs text-gray-500 uppercase mt-1">
                        {assessment.type}
                      </div>
                    </div>
                  </div>
                  {assessment.submission && (
                    <div className="mt-2 flex text-sm text-gray-500">
                      <div className="mr-6">
                        <span className="font-medium text-gray-600">
                          Submitted:
                        </span>{' '}
                        {formatDate(assessment.submission.submittedAt)}
                      </div>
                      {assessment.submission.gradedAt && (
                        <div>
                          <span className="font-medium text-gray-600">
                            Graded:
                          </span>{' '}
                          {formatDate(assessment.submission.gradedAt)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  {assessment.submission &&
                  assessment.submission.score !== undefined ? (
                    <div className="text-sm font-medium text-gray-900">
                      {assessment.submission.score} /{' '}
                      {assessment.totalPoints} points
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {Math.round(
                          (assessment.submission.score /
                            assessment.totalPoints) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  ) : assessment.submission ? (
                    <div className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Awaiting Grade
                    </div>
                  ) : (
                    <div className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      Not Submitted
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}

        {assessments.length === 0 && (
          <li>
            <div className="px-4 py-5 text-center text-gray-500">
              No assessments available for this course
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default AssessmentProgress;