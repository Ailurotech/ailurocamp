import { Assignment, AssessmentSubmission } from '@/types/assignment';

interface SubmissionStatusProps {
  submission: AssessmentSubmission;
  assignment: Assignment;
}

const formatTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString();
};

const getScorePercentage = (score: number, total: number) => {
  return Math.round((score / total) * 100);
};

export default function SubmissionStatus({
  submission,
  assignment,
}: SubmissionStatusProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        📋 Submission Status
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-green-600">Status</div>
          <div className="text-lg font-semibold text-green-800">Submitted</div>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-blue-600">Submitted At</div>
          <div className="text-lg font-semibold text-blue-800">
            {formatTime(submission.submittedAt)}
          </div>
        </div>
        {submission.score !== undefined && (
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-sm text-purple-600">Score</div>
            <div className="text-lg font-semibold text-purple-800">
              {submission.score} /{' '}
              {assignment.totalPoints || assignment.points || 0} (
              {getScorePercentage(
                submission.score || 0,
                assignment.totalPoints || assignment.points || 0
              )}
              %)
            </div>
          </div>
        )}
      </div>

      {submission.feedback && (
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">
            Instructor Feedback
          </h3>
          <p className="text-yellow-700">{submission.feedback}</p>
          {submission.gradedAt && (
            <p className="text-sm text-yellow-600 mt-2">
              Graded at: {formatTime(submission.gradedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
