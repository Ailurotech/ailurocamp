import React from 'react';

interface AssignmentStats {
  pending: number;
  overdue: number;
  submitted: number;
  graded: number;
}

interface AssignmentStatsCardsProps {
  stats: AssignmentStats;
}

export const AssignmentStatsCards: React.FC<AssignmentStatsCardsProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
        <div className="text-sm text-gray-600">Pending</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        <div className="text-sm text-gray-600">Overdue</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {stats.submitted}
        </div>
        <div className="text-sm text-gray-600">Submitted</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
        <div className="text-sm text-gray-600">Graded</div>
      </div>
    </div>
  );
};
