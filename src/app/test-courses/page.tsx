'use client';

import React from 'react';
import { useCourses } from '@/hooks/useCourses';

const TestCoursesPage: React.FC = () => {
  const { courses, isLoading, error, refetch } = useCourses();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">动态课程获取测试页面</h1>
        
        <div className="mb-4">
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? '加载中...' : '刷新课程列表'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800">错误信息：</h3>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-1">
              已切换到离线模式，显示测试数据
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">🔄 正在加载课程数据...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold mb-2">
              课程列表 ({courses.length} 个课程)
            </h2>
            
            {courses.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">没有找到任何课程</p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{course.description}</p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-500">
                        <span>📚 {course.category}</span>
                        <span>📊 {course.level}</span>
                        <span>👨‍🏫 {course.instructor?.name || '未知教师'}</span>
                        <span>💰 ¥{course.price}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        ID: {course._id}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">测试说明：</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• 如果您已登录，将显示真实的课程数据</li>
            <li>• 如果未登录或API失败，将显示测试课程数据</li>
            <li>• 在开发模式下，API会自动提供备用测试数据</li>
            <li>• 这些课程ID可以在作业创建页面中使用</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestCoursesPage;
