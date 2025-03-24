'use client';

import React from 'react';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEdit: () => Promise<void>;
  editTitle: string;
  setEditTitle: React.Dispatch<React.SetStateAction<string>>;
  editDesc: string;
  setEditDesc: React.Dispatch<React.SetStateAction<string>>;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  onClose,
  onSaveEdit,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Edit Course
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mt-1 w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Description
            </label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="mt-1 w-full p-2 border rounded-lg resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onSaveEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;
