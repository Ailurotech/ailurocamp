'use client';

import React from 'react';
import type { IModule } from '@/types/module';

interface ModuleCardProps {
  module: IModule | null;
  onClose: () => void;
  onEdit: (module: IModule) => void;
  isSavingEdit: boolean;
  onDelete: (module: IModule) => void;
  isDeleting: boolean;
}

function ModuleCard({
  module,
  onClose,
  onEdit,
  isSavingEdit,
  onDelete,
  isDeleting,
}: ModuleCardProps) {
  return (
    <div className="h-full bg-white border-l shadow-md flex flex-col">
      {module ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Module Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <h3 className="text-xl font-bold">Title: {module.title}</h3>
            <div>
              <h4 className="font-medium mb-1">Content:</h4>
              <p className="text-gray-700 text-sm">{module.content}</p>
            </div>
            <p className="text-sm text-gray-600">Order: {module.order}</p>
            <p className="text-sm text-gray-600">Duration: {module.duration} minutes</p>
          </div>

          {/* Footer with actions */}
          <div className="flex justify-end items-center p-4 border-t space-x-3">
            <button
              onClick={() => onEdit(module)}
              disabled={isSavingEdit}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {isSavingEdit ? 'Saving...' : 'Edit'}
            </button>
            <button
              onClick={() => onDelete(module)}
              disabled={isDeleting}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </>
      ): (
        <div className="h-full flex items-center justify-center text-gray-500">
          Select a module on the left
        </div>
      )}
    </div> 
  );
}

export default React.memo(ModuleCard);