
'use client';

import React from 'react';
import { ProgressReport, IProgressData } from '@/types/progress';

interface ProgressMetricsProps {
  report: ProgressReport;
  progressData: IProgressData;
  formatDate: (dateString?: string) => string;
  formatTime: (minutes: number) => string;
}

const ProgressMetrics: React.FC<ProgressMetricsProps> = ({
  report,
  progressData,
  formatDate,
  formatTime,
}) => {
  return (
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
                    width: `${report.percentComplete}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {report.percentComplete}%
              </span>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              Completed Lessons
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.completedLessonsCount} of {report.totalLessonsCount}{' '}
              lessons
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              Last Activity
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {progressData.lastAccessedAt
                ? formatDate(progressData.lastAccessedAt)
                : 'No activity yet'}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              Total Time Spent
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatTime(report.totalTimeSpent)}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              Assessments Completed
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report.completedAssessments} of {report.totalAssessments}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">
              Started On
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {progressData.completedLessons.length > 0
                ? formatDate(
                    [...progressData.completedLessons].sort(
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
  );
};

export default ProgressMetrics;