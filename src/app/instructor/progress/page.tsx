'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpenIcon } from '@/components/ui/Icons';

interface Course {
  id: string;
  title: string;
  _id?: string;
}

interface CourseApiResponse {
  id: string;
  title: string;
  _id?: string;
}

export default function InstructorProgressPage() {
  const { data: session, status } = useSession(); // Session data from NextAuth
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]); // State to store the list of courses
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state to show if fetching fails

  useEffect(() => {
    // If not authenticated, redirect to login page
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // If authenticated but the role is not instructor, redirect to the dashboard
    if (
      status === 'authenticated' &&
      !session?.user?.roles?.includes('instructor')
    ) {
      router.push('/dashboard');
      return;
    }

    const fetchCourses = async () => {
      try {
        // Fetch courses using the instructor's ID from the session
        const response = await fetch(
          `/api/instructor/course?instructorId=${session?.user?.id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();

        // Check if the courses data is an array and format it accordingly
        if (data.courses && Array.isArray(data.courses)) {
          const formattedCourses = data.courses.map((course: CourseApiResponse) => ({
            id: course._id || course.id,
            title: course.title,
          }));
          setCourses(formattedCourses);
        } else if (Array.isArray(data)) {
          const formattedCourses = data.map((course: CourseApiResponse) => ({
            id: course._id || course.id,
            title: course.title,
          }));
          setCourses(formattedCourses);
        } else {
          console.error('Unexpected API response format:', data);
          setCourses([]); // If the response format is unexpected, set courses to empty
        }
      } catch (err) {
        setError('Failed to load courses. Please try again.'); // Error handling
        console.error(err);
      } finally {
        setLoading(false); // Set loading to false after the fetch is complete
      }
    };

    if (status === 'authenticated') {
      fetchCourses(); // Fetch courses only if the user is authenticated
    }
  }, [session, status, router]);

  // Show a loading spinner while fetching data
  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Display error message if the fetch failed
  if (error) {
    return (
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render course progress page
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Student Progress Tracking
        </h1>

        {/* Icons and descriptions for course tracking */}

        {/* Show no courses message if there are no courses */}
        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">
              No courses found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              You don't have any courses yet. Create a course to start tracking
              student progress.
            </p>
            <div className="mt-6">
              <Link
                href="/instructor/courses/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create a new course
              </Link>
            </div>
          </div>
        ) : (
          // Render the courses if found
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/instructor/progress/${course.id}`}
                className="block hover:shadow-lg transition-shadow duration-200"
              >
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                        <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          View detailed student progress
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-600">
                      View Progress
                    </span>
                    <svg
                      className="h-5 w-5 text-indigo-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
