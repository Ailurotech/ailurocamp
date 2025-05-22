'use client';

import React from 'react';
import {
  LessonProgress as ILessonProgress,
  ICourseModule,
} from '@/types/progress';

interface LessonProgressProps {
  completedLessons: ILessonProgress[];
  courseModules: ICourseModule[];
  formatDate: (dateString?: string) => string;
  formatTime: (minutes: number) => string;
}

const LessonProgress: React.FC<LessonProgressProps> = ({
  completedLessons,
  courseModules,
  formatDate,
  formatTime,
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {completedLessons
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
            const module = courseModules[lesson.moduleIndex];
            const moduleName = module
              ? module.title
              : `Module ${lesson.moduleIndex + 1}`;

            const lessonTitle =
              module && module.lessons && module.lessons[lesson.lessonIndex]
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

        {completedLessons.length === 0 && (
          <li>
            <div className="px-4 py-5 text-center text-gray-500">
              No lesson progress data available
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default LessonProgress;
