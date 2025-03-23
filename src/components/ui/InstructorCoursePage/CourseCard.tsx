import clsx from 'clsx';
import type { ICourse } from '@/types/course';
import { useRouter } from 'next/navigation';
import React from 'react';

interface CourseCardProps {
  course: ICourse | null;
  onPublishToggle: (course: ICourse) => void;
  onEdit: (course: ICourse) => void;
  isSavingEdit: boolean;
  onDelete: (course: ICourse) => void;
  isDeleting: boolean;
  isPublishing: boolean;
}

function CourseCard({
  course,
  onPublishToggle,
  onEdit,
  isSavingEdit,
  onDelete,
  isDeleting,
  isPublishing = false,
}: CourseCardProps) {
  const router = useRouter();

  return (
    <div className="h-full bg-white border-l shadow-md flex flex-col">
      {course ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Course Details</h2>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <h3 className="text-xl font-bold">Title: {course.title}</h3>
            <div>
              <h4 className="font-medium mb-1">Description:</h4>
              <p className="text-gray-700 text-sm">{course.description}</p>
            </div>
            <p className="text-sm text-gray-600">
              Students: {course.enrolledStudents.length}
            </p>
            <p className="text-sm text-gray-600">
              Rating: {course.averageRating.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Revenue: ${course.revenue}</p>
            <p className="text-sm text-gray-600">
              <button
                onClick={() =>
                  router.push(`/instructor/courses/${course._id}/review`)
                }
                className="text-blue-500 hover:underline"
              >
                View Reviews
              </button>
            </p>
            <div className="space-x-2 mt-4">
              <span
                className={clsx(
                  'inline-flex px-2 text-xs font-semibold rounded-full',
                  course.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-800'
                )}
              >
                {course.status}
              </span>
            </div>
          </div>

          {/* Footer with actions */}
          <div className="flex justify-end items-center p-4 border-t space-x-3">
            <button
              onClick={() => onPublishToggle(course)}
              disabled={isPublishing}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isPublishing
                ? 'Processing...'
                : course.status === 'published'
                  ? 'Unpublish'
                  : 'Publish'}
            </button>
            <button
              onClick={() => onEdit(course)}
              disabled={isSavingEdit}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {isSavingEdit ? 'Saving...' : 'Edit'}
            </button>
            <button
              onClick={() => onDelete(course)}
              disabled={isDeleting}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          Select a course on the left
        </div>
      )}
    </div>
  );
}

export default React.memo(CourseCard);
