'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
// Remove unused import: ClockIcon
// Remove StarIcon from import since it's not used in the component
import { BookOpenIcon, UsersIcon } from '@/components/ui/Icons';
import { User } from '@/types';
import { Course } from '@/types/course';

export default function InstructorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [instructor, setInstructor] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const instructorId = params.id as string;

  const fetchInstructorData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch instructor info
      const userResponse = await fetch(`/api/users/${instructorId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch instructor information');
      }
      const userData = await userResponse.json();
      setInstructor(userData);

      // Fetch instructor's courses using instructor name
      const coursesResponse = await fetch(
        `/api/courses?instructorName=${encodeURIComponent(userData.name)}&page=1&limit=50`
      );
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }
    } catch (err) {
      console.error('Error fetching instructor data:', err);
      setError('Failed to load instructor data');
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    if (session?.user && instructorId) {
      fetchInstructorData();
    }
  }, [session, instructorId, fetchInstructorData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading instructor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Instructor not found</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-6">
            // Replace the img element around line 105:
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              {instructor.avatar ? (
                <Image
                  src={instructor.avatar || '/default-avatar.png'}
                  alt={instructor.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <UsersIcon className="w-12 h-12 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {instructor.name}
              </h1>
              <p className="text-gray-600 mt-1">{instructor.email}</p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Instructor
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Courses by {instructor.name}
          </h2>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No courses available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/courses/${course._id}`)
                  }
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {course.category}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {course.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        ${course.price}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm">
                          {(course.averageRating || 0).toFixed(1)} (
                          {course.ratingCount || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
