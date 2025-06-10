'use client';

import React, { useEffect, useState } from 'react';
import { Assignment } from '@/types/assignment';
import Link from 'next/link';

// 定义API响应中的作业项目类型
interface ApiAssignmentItem {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  points?: number;
  courseId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const AssignmentListPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      // 使用新的API端点获取所有作业
      const response = await fetch('/api/assignments');
      const data = await response.json();
      
      if (data.assignments) {
        // 转换为 Assignment 类型
        const converted = data.assignments.map((item: ApiAssignmentItem) => ({
          ...item,
          questions: [],
          timeLimit: 0,
          passingScore: 0,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        })) as Assignment[];
        setAssignments(converted);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch assignments:', error);
      // 设置错误状态，不使用误导性的备用数据
      setError(error instanceof Error ? error.message : '获取作业列表失败');
      setAssignments([]);
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
          <h1 className="text-2xl font-bold text-gray-800">
            📋 Assignment List
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchAssignments}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              🔄 Refresh
            </button>
            <Link
              href="/assignments/create-with-course"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              ➕ Create Assignment
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">无法加载作业列表</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAssignments}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              重试
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-gray-500">No assignments created yet.</p>
        ) : (
          <ul className="space-y-4">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="border border-gray-300 rounded-md p-4 flex flex-col gap-2"
              >
                <div>
                  <h2 className="text-lg font-semibold">{assignment.title}</h2>
                  <p
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{ __html: assignment.description }}
                  ></p>
                  <p className="text-sm text-gray-400 mt-1">
                    Due: {assignment.dueDate || 'N/A'} | Time Limit:{' '}
                    {assignment.timeLimit} mins | Passing:{' '}
                    {assignment.passingScore}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/assignments/${assignment.id}`}>
                    <button className="text-blue-600 hover:underline">
                      🔍 View
                    </button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssignmentListPage;
