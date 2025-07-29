import Link from 'next/link';
import { Assignment } from '@/types/assignment';

interface AssignmentHeaderProps {
  assignment: Assignment;
}

export default function AssignmentHeader({
  assignment,
}: AssignmentHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/dashboard/assignments"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to All Assignments
      </Link>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {assignment.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">Points</div>
            <div className="text-lg font-semibold">
              {assignment.totalPoints || assignment.points || 0}
            </div>
          </div>
          {assignment.dueDate && (
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-500">Due Date</div>
              <div className="text-lg font-semibold">
                {new Date(assignment.dueDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: assignment.description }}
        />
      </div>
    </div>
  );
}
