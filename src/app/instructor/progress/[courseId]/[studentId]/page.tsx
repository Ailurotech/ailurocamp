'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

// Import refactored components
import ProgressTabs from '@/components/instructor/StudentProgressPage/ProgressTabs';
import LessonProgress from '@/components/instructor/StudentProgressPage/LessonProgress';
import AssessmentProgress from '@/components/instructor/StudentProgressPage/AssessmentProgress';
import ProgressMetrics from '@/components/instructor/StudentProgressPage/ProgressMetrics';
import ProgressReport from '@/components/instructor/StudentProgressPage/ProgressReport';

// Import types
import {
  StudentProgressData,
  ProgressReport as ProgressReportType,
  TabType,
} from '@/types/progress';

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
  const [activeTab, setActiveTab] = useState<TabType>('lessons');

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
  const generateReport = (): ProgressReportType | null => {
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
        : progressData.progress.overallProgress;

    // Add debug logs
    console.log('Progress Data:', {
      completedLessonsCount,
      totalLessonsCount,
      dbProgress: progressData.progress.overallProgress,
      calculatedProgress: percentComplete,
    });

    // If calculated progress differs from the database, update local state first
    // and then update database in background
    if (
      percentComplete !== progressData.progress.overallProgress &&
      totalLessonsCount > 0
    ) {
      // Update local state immediately
      setProgressData({
        ...progressData,
        progress: {
          ...progressData.progress,
          overallProgress: percentComplete,
        },
      });

      // Update database in background
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

  // Add function to update progress in database
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

      // Update local state
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
        {report && (
          <ProgressMetrics
            report={report}
            progressData={progressData.progress}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )}

        {/* Tab switching */}
        <ProgressTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Lesson progress list */}
        {activeTab === 'lessons' && (
          <LessonProgress
            completedLessons={progressData.progress.completedLessons}
            courseModules={progressData.course.modules}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )}

        {/* Assessment results list */}
        {activeTab === 'assessments' && (
          <AssessmentProgress
            assessments={progressData.assessments}
            formatDate={formatDate}
          />
        )}

        {/* Progress report */}
        {activeTab === 'report' && report && (
          <ProgressReport
            report={report}
            student={progressData.student}
            course={progressData.course}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )}
      </div>
    </div>
  );
}
