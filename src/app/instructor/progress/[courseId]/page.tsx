'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface StudentProgress {
  student: Student;
  overallProgress: number;
  lastAccessedAt: string;
  completedLessons: {
    moduleIndex: number;
    lessonIndex: number;
    completed: boolean;
    timeSpent: number;
  }[];
}

interface CourseData {
  id: string;
  title: string;
}

interface PageParams {
  courseId: string;
}

export default function CourseProgressPage({
  params,
}: {
  params: { courseId: string };
}) {
  // Use React.use() to resolve params with proper type casting
  const resolvedParams = use(params as any) as PageParams;
  const courseId = resolvedParams.courseId;

  const { data: session, status } = useSession();
  const router = useRouter();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>(
    []
  );
  const [studentsWithoutProgress, setStudentsWithoutProgress] = useState<
    Student[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Redirect unauthenticated users or non-instructor users
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (
      status === 'authenticated' &&
      !session?.user?.roles?.includes('instructor')
    ) {
      router.push('/dashboard');
      return;
    }

    // Fetch course student progress data
    const fetchStudentProgress = async () => {
      try {
        const response = await fetch(
          `/api/instructor/student-progress/${courseId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch student progress');
        }

        const data = await response.json();
        setCourse(data.course);
        setStudentsProgress(data.studentsProgress || []);
        setStudentsWithoutProgress(data.studentsWithoutProgress || []);
      } catch (err) {
        setError('Failed to load student progress data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchStudentProgress();
    }
  }, [courseId, session, status, router]);

  // Filter student list
  const filteredStudentsProgress = studentsProgress.filter(
    (progress) =>
      progress.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      progress.student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentsWithoutProgress = studentsWithoutProgress.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <Link
            href="/instructor/progress"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Courses
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-4">
            {course?.title} - Student Progress
          </h1>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Students
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {studentsProgress.length +
                          studentsWithoutProgress.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Students
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {studentsProgress.length}
                      </div>
                      <span className="ml-2 text-sm text-green-600">
                        {studentsProgress.length > 0
                          ? Math.round(
                              (studentsProgress.length /
                                (studentsProgress.length +
                                  studentsWithoutProgress.length)) *
                                100
                            ) + '%'
                          : '0%'}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Average Progress
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {studentsProgress.length > 0
                          ? Math.round(
                              studentsProgress.reduce(
                                (sum, student) => sum + student.overallProgress,
                                0
                              ) / studentsProgress.length
                            ) + '%'
                          : '0%'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Inactive Students
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {studentsWithoutProgress.length}
                      </div>
                      <span className="ml-2 text-sm text-yellow-600">
                        {studentsWithoutProgress.length > 0
                          ? Math.round(
                              (studentsWithoutProgress.length /
                                (studentsProgress.length +
                                  studentsWithoutProgress.length)) *
                                100
                            ) + '%'
                          : '0%'}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search students by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active students progress */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Students with Activity
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {filteredStudentsProgress.length} students have started the course
            </p>
          </div>

          {filteredStudentsProgress.length > 0 ? (
            <ul role="list" className="divide-y divide-gray-200">
              {filteredStudentsProgress.map((progress) => (
                <li key={progress.student._id}>
                  <Link
                    href={`/instructor/progress/${courseId}/${progress.student._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-800 font-medium">
                                {progress.student.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {progress.student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {progress.student.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-6">
                            <div className="flex items-center">
                              <svg
                                className="text-green-500 h-5 w-5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-sm text-gray-700">
                                {progress.completedLessons?.filter(
                                  (l) => l.completed
                                )?.length || 0}{' '}
                                lessons completed
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className="text-xs text-gray-500">
                                Last activity:{' '}
                                {new Date(
                                  progress.lastAccessedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-indigo-600 h-2.5 rounded-full"
                                style={{
                                  width: `${progress.overallProgress}%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {progress.overallProgress}%
                            </span>
                          </div>
                          <div className="ml-5">
                            <svg
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              No students found with this search criteria
            </div>
          )}
        </div>

        {/* Students who haven't started learning */}
        {filteredStudentsWithoutProgress.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Students Not Started
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {filteredStudentsWithoutProgress.length} enrolled students
                haven't started the course
              </p>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {filteredStudentsWithoutProgress.map((student) => (
                <li key={student._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <button
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md text-sm font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            // Email or reminder functionality can be implemented here
                            alert(`Reminder would be sent to ${student.name}`);
                          }}
                        >
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
