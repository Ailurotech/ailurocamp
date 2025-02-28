'use client';

import React from 'react';
import type { ICourse } from '@/types/course';

interface DeleteCourseModalProps {
  isOpen: boolean;
  courseToDelete: ICourse | null; // Selected course to delete
  onClose: () => void;
  onDelete: (courseId: string) => Promise<void>; // Pass the courseId to his parent component
  isDeleting: boolean;
}

const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
  isOpen,
  courseToDelete,
  onClose,
  onDelete,
  isDeleting,
}) => {
  if (!isOpen || !courseToDelete) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Delete Confirmation
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete{' '}
          <strong>{courseToDelete.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(courseToDelete._id)}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCourseModal;
