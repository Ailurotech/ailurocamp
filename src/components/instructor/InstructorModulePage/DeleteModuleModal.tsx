'use client';

import React from 'react';
import type { IModule } from '@/types/module';

interface DeleteModuleModalProps {
  isOpen: boolean;
  moduleToDelete: IModule | null; // Seleted module to delete
  onClose: () => void;
  onDelete: (moduleId: string) => Promise<void>; // Pass the moduleId to his parent component
}

export default function DeleteModuleModal({
  isOpen,
  moduleToDelete,
  onClose,
  onDelete,
}: DeleteModuleModalProps) {
  if (!isOpen || !moduleToDelete) return null;

  // const handleDelete = async () => {
  //   await onConfirmDelete(moduleToDelete._id);
  //   onClose();
  // };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Delete Confirmation
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete{' '}
          <strong>{moduleToDelete.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(moduleToDelete._id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
