import React from 'react';

interface SubmissionProgressProps {
  answeredQuestions: number;
  totalQuestions: number;
}

export default function SubmissionProgress({ 
  answeredQuestions, 
  totalQuestions 
}: SubmissionProgressProps) {
  return (
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
  );
}
