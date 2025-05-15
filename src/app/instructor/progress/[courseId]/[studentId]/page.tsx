'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface LessonProgress {
  moduleIndex: number;
  lessonIndex: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  timeSpent: number;
  lastPosition?: number;
}

interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment';
  totalPoints: number;
  submission?: {
    score?: number;
    submittedAt: string;
    gradedAt?: string;
  };
}

interface StudentProgressData {
  student: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    modules: {
      title: string;
      lessons: {
        title: string;
      }[];
    }[];
  };
  progress: {
    overallProgress: number;
    completedModules: {
      moduleIndex: number;
      completedAt: string;
      timeSpent: number;
    }[];
    completedLessons: LessonProgress[];
    lastAccessedAt: string | null;
  };
  assessments: Assessment[];
}

interface PageParams {
  courseId: string;
  studentId: string;
}

export default function StudentProgressDetailPage({
  params,
}: {
  params: { courseId: string; studentId: string };
}) {
  // Use React.use() to resolve params with proper type casting
  const resolvedParams = use(params as any) as PageParams;
  const { courseId, studentId } = resolvedParams;

  const { data: session, status } = useSession();
  const router = useRouter();

  const [progressData, setProgressData] = useState<StudentProgressData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'lessons' | 'assessments' | 'report'
  >('lessons');

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

    // Fetch student progress details
    const fetchStudentProgressDetail = async () => {
      try {
        console.log('Fetching data for:', courseId, studentId);
        const response = await fetch(
          `/api/instructor/student-progress/${courseId}/${studentId}`
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        setProgressData(data);
      } catch (err) {
        console.error('Detailed error:', err);
        setError('Failed to load student progress details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchStudentProgressDetail();
    }
  }, [courseId, studentId, session, status, router]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Identify struggling students (based on completion progress and time)
  const identifyStruggling = (): boolean => {
    if (!progressData) return false;

    // No progress or low progress
    if (progressData.progress.overallProgress < 25) return true;

    // No activity in the last two weeks
    if (progressData.progress.lastAccessedAt) {
      const lastActivity = new Date(progressData.progress.lastAccessedAt);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      if (lastActivity < twoWeeksAgo) return true;
    }

    // Time spent is much higher than average (assuming estimated module time)
    const excessiveTimeSpent = progressData.progress.completedLessons.some(
      (lesson) => lesson.timeSpent > 90 // Assuming over 90 minutes is abnormal
    );

    return excessiveTimeSpent;
  };

  // Generate progress report
  const generateReport = () => {
    if (!progressData) return null;

    const completedLessonsCount = progressData.progress.completedLessons.filter(
      (l) => l.completed
    ).length;

    console.log('Course Modules:', progressData.course.modules);

    let totalLessonsCount = 0;
    if (
      progressData.course.modules &&
      Array.isArray(progressData.course.modules)
    ) {
      progressData.course.modules.forEach((module, index) => {
        console.log(`Module ${index}:`, module);
        console.log(`Module ${index} lessons:`, module.lessons);

        if (module.lessons && Array.isArray(module.lessons)) {
          totalLessonsCount += module.lessons.length;
        }
      });
    }

    // If total lessons count is 0 but there are completed lessons, use completed lessons as reference
    if (
      totalLessonsCount === 0 &&
      progressData.progress.completedLessons.length > 0
    ) {
      // Find the maximum module index and lesson index
      const maxModuleIndex = Math.max(
        ...progressData.progress.completedLessons.map((l) => l.moduleIndex)
      );

      // Create a set for each module to record known lesson indices
      const estimatedLessons = progressData.progress.completedLessons.reduce(
        (acc, lesson) => {
          if (!acc[lesson.moduleIndex]) {
            acc[lesson.moduleIndex] = new Set();
          }
          acc[lesson.moduleIndex].add(lesson.lessonIndex);
          return acc;
        },
        {} as Record<number, Set<number>>
      );

      // Calculate estimated total lessons
      totalLessonsCount = Object.values(estimatedLessons).reduce(
        (sum, set) => sum + set.size,
        0
      );

      console.log(
        'Estimated total lessons from completed lessons:',
        totalLessonsCount
      );
    }

    // If still 0, use database progress value for reverse calculation
    if (totalLessonsCount === 0 && progressData.progress.overallProgress > 0) {
      // Assuming database progress is correct, calculate total lessons count
      totalLessonsCount = Math.ceil(
        (completedLessonsCount * 100) / progressData.progress.overallProgress
      );
      console.log('Reverse calculated total lessons:', totalLessonsCount);
    }

    const totalTimeSpent = progressData.progress.completedLessons.reduce(
      (total, lesson) => total + lesson.timeSpent,
      0
    );

    const completedAssessments = progressData.assessments.filter(
      (a) => a.submission
    ).length;

    const averageScore =
      progressData.assessments
        .filter((a) => a.submission && a.submission.score !== undefined)
        .reduce((total, a) => total + (a.submission?.score || 0), 0) /
      (progressData.assessments.filter(
        (a) => a.submission && a.submission.score !== undefined
      ).length || 1);

    const percentComplete =
      totalLessonsCount > 0
        ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
        : progressData.progress.overallProgress; // 如果无法计算，则使用数据库中的值

    // 添加调试日志
    console.log('Progress Data:', {
      completedLessonsCount,
      totalLessonsCount,
      dbProgress: progressData.progress.overallProgress,
      calculatedProgress: percentComplete,
    });

    // 如果计算出的进度与数据库中的不同，则更新数据库
    if (
      percentComplete !== progressData.progress.overallProgress &&
      totalLessonsCount > 0
    ) {
      updateProgressInDatabase(percentComplete);
    }

    return {
      completedLessonsCount,
      totalLessonsCount,
      percentComplete,
      totalTimeSpent,
      completedAssessments,
      totalAssessments: progressData.assessments.length,
      averageScore: isNaN(averageScore) ? 0 : Math.round(averageScore),
      isStruggling: identifyStruggling(),
    };
  };

  // 添加更新数据库中进度的函数
  const updateProgressInDatabase = async (newProgress: number) => {
    try {
      const response = await fetch(
        `/api/instructor/update-progress/${courseId}/${studentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            overallProgress: newProgress,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          'Failed to update progress in database:',
          response.status
        );
        return;
      }

      console.log('Progress updated in database successfully');

      // 更新本地状态
      if (progressData) {
        setProgressData({
          ...progressData,
          progress: {
            ...progressData.progress,
            overallProgress: newProgress,
          },
        });
      }
    } catch (err) {
      console.error('Error updating progress in database:', err);
    }
  };

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

  if (!progressData) {
    return (
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No progress data found for this student.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const report = generateReport();

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <Link
            href={`/instructor/progress/${courseId}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Course Progress
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-4">
            {progressData.student.name} - Progress Details
          </h1>
          <p className="text-gray-500">{progressData.course.title}</p>
        </div>

        {/* Student progress overview */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Progress Overview
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Overall Progress
                </dt>
                <dd className="mt-1 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{
                        width: `${report?.percentComplete}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {report?.percentComplete}%
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Completed Lessons
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {report?.completedLessonsCount} of {report?.totalLessonsCount}{' '}
                  lessons
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Last Activity
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {progressData.progress.lastAccessedAt
                    ? formatDate(progressData.progress.lastAccessedAt)
                    : 'No activity yet'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Total Time Spent
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatTime(report?.totalTimeSpent || 0)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Assessments Completed
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {report?.completedAssessments} of {report?.totalAssessments}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Started On
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {progressData.progress.completedLessons.length > 0
                    ? formatDate(
                        [...progressData.progress.completedLessons].sort(
                          (a, b) =>
                            new Date(a.startedAt).getTime() -
                            new Date(b.startedAt).getTime()
                        )[0]?.startedAt
                      )
                    : 'Not started yet'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Tab switching */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex">
            <button
              className={`${
                activeTab === 'lessons'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
              onClick={() => setActiveTab('lessons')}
            >
              Lessons Progress
            </button>
            <button
              className={`${
                activeTab === 'assessments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
              onClick={() => setActiveTab('assessments')}
            >
              Assessment Results
            </button>
            <button
              className={`${
                activeTab === 'report'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('report')}
            >
              Progress Report
            </button>
          </nav>
        </div>

        {/* Lesson progress list */}
        {activeTab === 'lessons' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {progressData.progress.completedLessons
                .sort((a, b) => {
                  // First sort by module index
                  if (a.moduleIndex !== b.moduleIndex) {
                    return a.moduleIndex - b.moduleIndex;
                  }
                  // Then sort by lesson index
                  return a.lessonIndex - b.lessonIndex;
                })
                .map((lesson) => {
                  // Get module and lesson titles
                  const module =
                    progressData.course.modules[lesson.moduleIndex];
                  const moduleName = module
                    ? module.title
                    : `Module ${lesson.moduleIndex + 1}`;

                  const lessonTitle =
                    module &&
                    module.lessons &&
                    module.lessons[lesson.lessonIndex]
                      ? module.lessons[lesson.lessonIndex].title
                      : `Lesson ${lesson.lessonIndex + 1}`;

                  return (
                    <li key={`${lesson.moduleIndex}-${lesson.lessonIndex}`}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              {lesson.completed ? (
                                <svg
                                  className="text-green-500 h-5 w-5 mr-2"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="text-gray-400 h-5 w-5 mr-2"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              <div className="text-sm font-medium text-gray-900">
                                {moduleName} - {lessonTitle}
                              </div>
                            </div>
                            <div className="mt-2 flex text-sm text-gray-500">
                              <div className="mr-6">
                                <span className="font-medium text-gray-600">
                                  Started:
                                </span>{' '}
                                {formatDate(lesson.startedAt)}
                              </div>
                              {lesson.completed && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Completed:
                                  </span>{' '}
                                  {formatDate(lesson.completedAt)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-sm text-gray-900 font-medium">
                              {formatTime(lesson.timeSpent)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lesson.completed ? 'Completed' : 'In progress'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}

              {progressData.progress.completedLessons.length === 0 && (
                <li>
                  <div className="px-4 py-5 text-center text-gray-500">
                    No lesson progress data available
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Assessment results list */}
        {activeTab === 'assessments' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {progressData.assessments.map((assessment) => (
                <li key={assessment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          {assessment.submission ? (
                            <svg
                              className="text-green-500 h-5 w-5 mr-2"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="text-gray-400 h-5 w-5 mr-2"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assessment.title}
                            </div>
                            <div className="text-xs text-gray-500 uppercase mt-1">
                              {assessment.type}
                            </div>
                          </div>
                        </div>
                        {assessment.submission && (
                          <div className="mt-2 flex text-sm text-gray-500">
                            <div className="mr-6">
                              <span className="font-medium text-gray-600">
                                Submitted:
                              </span>{' '}
                              {formatDate(assessment.submission.submittedAt)}
                            </div>
                            {assessment.submission.gradedAt && (
                              <div>
                                <span className="font-medium text-gray-600">
                                  Graded:
                                </span>{' '}
                                {formatDate(assessment.submission.gradedAt)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        {assessment.submission &&
                        assessment.submission.score !== undefined ? (
                          <div className="text-sm font-medium text-gray-900">
                            {assessment.submission.score} /{' '}
                            {assessment.totalPoints} points
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {Math.round(
                                (assessment.submission.score /
                                  assessment.totalPoints) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        ) : assessment.submission ? (
                          <div className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Awaiting Grade
                          </div>
                        ) : (
                          <div className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Not Submitted
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              {progressData.assessments.length === 0 && (
                <li>
                  <div className="px-4 py-5 text-center text-gray-500">
                    No assessments available for this course
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Progress report */}
        {activeTab === 'report' && report && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Student Progress Report
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Student Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {progressData.student.name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Course</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {progressData.course.title}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Completion Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${report.percentComplete}%` }}
                        ></div>
                      </div>
                      <span>
                        {report.percentComplete}% Complete (
                        {report.completedLessonsCount} of{' '}
                        {report.totalLessonsCount} lessons)
                      </span>
                    </div>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Time Investment
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatTime(report.totalTimeSpent)}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Assessment Performance
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {report.completedAssessments > 0 ? (
                      <div>
                        <span className="font-medium">
                          {report.averageScore}%{' '}
                        </span>
                        average score ({report.completedAssessments} of{' '}
                        {report.totalAssessments} completed)
                      </div>
                    ) : (
                      'No assessments completed'
                    )}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Learning Status
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    {report.isStruggling ? (
                      <div className="px-4 py-3 bg-red-50 text-red-800 rounded-md">
                        <div className="flex">
                          <svg
                            className="h-5 w-5 text-red-400 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">
                            Potential learning difficulties detected
                          </span>
                        </div>
                        <p className="mt-2">
                          This student may be struggling with the course
                          material. Consider providing additional support or
                          resources.
                        </p>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-green-50 text-green-800 rounded-md">
                        <div className="flex">
                          <svg
                            className="h-5 w-5 text-green-400 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">On track</span>
                        </div>
                        <p className="mt-2">
                          The student is progressing well through the course
                          material.
                        </p>
                      </div>
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Actions</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 flex space-x-4">
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm"
                      onClick={() => {
                        // Open report in new tab
                        window.open(`/api/instructor/export-progress/${courseId}/${studentId}`, '_blank');
                      }}
                    >
                      Export Report
                    </button>
                    <button
                      className="btn-base btn-gray flex-center"
                      onClick={() => {
                        // Send progress notification feature
                        alert(
                          `Progress notification would be sent to ${progressData.student.name}`
                        );
                      }}
                    >
                      Send Progress Notification
                    </button>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
