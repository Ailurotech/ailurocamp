'use client';

import React, { useEffect, useState } from 'react';
import { Assignment } from '@/types/assignment';

const AssignmentListPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assignments');
      const data = await res.json();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📋 Assignment List</h1>
          <div className="flex gap-2">
    <button
      onClick={fetchAssignments}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      🔄 Refresh
    </button>
    <a
      href="/assignments/create"
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
    >
      ➕ Create Assignment
    </a>
  </div>

        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : assignments.length === 0 ? (
          <p className="text-gray-500">No assignments created yet.</p>
        ) : (
          <ul className="space-y-4">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="border border-gray-300 rounded-md p-4">
                <h2 className="text-lg font-semibold">{assignment.title}</h2>
                <p className="text-gray-600">{assignment.description}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Due: {assignment.dueDate || 'N/A'} | Time Limit: {assignment.timeLimit} mins | Passing: {assignment.passingScore}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssignmentListPage;
