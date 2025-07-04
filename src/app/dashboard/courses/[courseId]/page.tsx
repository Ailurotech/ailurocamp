'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BookOpenIcon, ClockIcon, PlayIcon } from '@/components/ui/Icons';

interface Module {
  _id: string;
  title: string;
  content: string;
  duration: number;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
  instructor: {
    name: string;
    email: string;
  };
  category: string;
  level: string;
  averageRating: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseId = params.courseId as string;

  useEffect(() => {
    if (session?.user && courseId) {
      fetchCourse();
    }
  }, [session, courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/student/courses/${courseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      const data = await response.json();
      setCourse(data.course);
      if (data.course.modules.length > 0) {
        setSelectedModule(data.course.modules[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error || 'Course not found'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Courses
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Instructor: {course.instructor.name}</span>
          <span>Level: {course.level}</span>
          <span>Category: {course.category}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Module List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Course Modules</h2>
          <div className="space-y-2">
            {course.modules
              .sort((a, b) => a.order - b.order)
              .map((module, index) => (
                <button
                  key={module._id}
                  onClick={() => setSelectedModule(module)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedModule?._id === module._id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {module.title}
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {module.duration} min
                      </div>
                    </div>
                    <PlayIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Module Content */}
        <div className="lg:col-span-2">
          {selectedModule ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedModule.title}
              </h2>
              <div className="flex items-center mb-6 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                Duration: {selectedModule.duration} minutes
              </div>
              <div className="prose max-w-none">
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedModule.content }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Select a module to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}