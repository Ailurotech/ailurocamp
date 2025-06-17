'use client';

import React from 'react';
import {
  ProgressReport as IProgressReport,
  IStudentUser,
  IStudentProgressCourse,
} from '@/types/progress';

interface ProgressReportProps {
  report: IProgressReport;
  student: IStudentUser;
  course: IStudentProgressCourse;
  formatDate: (dateString?: string) => string;
  formatTime: (minutes: number) => string;
}

const ProgressReport: React.FC<ProgressReportProps> = ({
  report,
  student,
  course,
  formatTime,
}) => {
  return (
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
            <dt className="text-sm font-medium text-gray-500">Student Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {student.name}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Course</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {course.title}
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
                  {report.completedLessonsCount} of {report.totalLessonsCount}{' '}
                  lessons)
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
                  <span className="font-medium">{report.averageScore}% </span>
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
                    This student may be struggling with the course material.
                    Consider providing additional support or resources.
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
                    The student is progressing well through the course material.
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
                  window.open(
                    `/api/instructor/export-progress/${course.id}/${student.id}`,
                    '_blank'
                  );
                }}
              >
                Export Report
              </button>
              <button
                className="btn-base btn-gray flex-center"
                onClick={() => {
                  // Send progress notification feature
                  alert(
                    `Progress notification would be sent to ${student.name}`
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
  );
};

export default ProgressReport;
