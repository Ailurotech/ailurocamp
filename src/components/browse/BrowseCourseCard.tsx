'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UsersIcon, ClockIcon } from '@/components/ui/Icons';
import { BrowseCourseCardProps } from '@/types/components';

export default function BrowseCourseCard({ course }: BrowseCourseCardProps) {
  const router = useRouter();

  const handleCourseClick = () => {
    router.push(`/dashboard/courses/${course._id}`);
  };

  const handleInstructorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/instructor/${course.instructor._id}`);
  };

  const totalDuration = course.modules.reduce(
    (total, module) => total + module.duration,
    0
  );

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCourseClick}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span
              className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
              onClick={handleInstructorClick}
            >
              {course.instructor.name}
            </span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {Math.round(totalDuration)} min
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {course.level}
          </span>
          <span className="text-sm font-medium text-gray-900">
            ${course.price}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {course.modules.length} modules
          </span>
          <span className="text-sm text-gray-500">{course.category}</span>
        </div>
      </div>
    </div>
  );
}
