'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, UsersIcon } from '@/components/ui/Icons';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Array<{
    _id: string;
    title: string;
    duration: number;
    order: number;
  }>;
  instructor: {
    name: string;
    email: string;
  };
  category: string;
  level: string;
  averageRating: number;
  createdAt: string;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const totalDuration = course.modules?.reduce(
    (total, module) => total + (module.duration || 0),
    0
  );

  return (
    <Link href={`/dashboard/courses/${course._id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer">
        {course.thumbnail && (
          <Image
            src={course.thumbnail}
            alt={course.title}
            width={400}
            height={192}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-1" />
              {course.instructor.name}
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {Math.round(totalDuration)} min
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {course.level}
            </span>
            <span className="text-sm text-gray-500">
              {course.modules.length} modules
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
