'use client';

import React, { useState } from 'react';
import AssignmentForm from '@/components/assignment/AssignmentForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourses } from '@/hooks/useCourses';

const CreateAssignmentWithCoursePage: React.FC = () => {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const { courses: availableCourses, isLoading, error } = useCourses();
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <div className="mb-4">
          <Link href="/assignments" className="text-blue-600 hover:underline">
            ← 返回作业列表
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          📚 创建新作业
        </h1>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">⚠️ {error}</p>
            <p className="text-sm text-red-600 mt-1">
              已切换到离线模式，使用测试课程数据
            </p>
          </div>
        )}

        {/* 课程选择 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择课程 *
          </label>
          
          {isLoading ? (
            <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
              <span className="text-gray-500">🔄 正在加载课程列表...</span>
            </div>
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">请选择课程...</option>
              {availableCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} - {course.instructor?.name || '未知教师'} ({course.level})
                </option>
              ))}
            </select>
          )}
          
          {selectedCourseId && !isLoading && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✅ 已选择: {availableCourses.find(c => c._id === selectedCourseId)?.title}
              </p>
              <p className="text-xs text-green-600">
                教师: {availableCourses.find(c => c._id === selectedCourseId)?.instructor?.name} | 
                级别: {availableCourses.find(c => c._id === selectedCourseId)?.level} | 
                分类: {availableCourses.find(c => c._id === selectedCourseId)?.category}
              </p>
            </div>
          )}
        </div>

        {/* 作业表单 */}
        {selectedCourseId && !isLoading ? (
          <AssignmentForm
            courseId={selectedCourseId}
            onSubmit={async () => {
              console.log('Creating assignment for course:', selectedCourseId);
              router.push('/assignments');
            }}
          />
        ) : !isLoading ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              请先选择一个课程，然后再创建作业。
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CreateAssignmentWithCoursePage;
