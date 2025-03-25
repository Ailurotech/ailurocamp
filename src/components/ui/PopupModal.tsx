'use client';

import React from 'react';

export interface PopupProps {
  message: string;
  type: 'success' | 'error';
  onOK?: () => void;
  onClose: () => void;
}

export default function PopupModal({
  message,
  type = 'success',
  onOK,
  onClose,
}: PopupProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-md max-w-sm mx-auto">
        <p className={type === 'success' ? 'text-black' : 'text-red-600'}>
          {message}
        </p>

        <div className="mt-4 flex justify-end space-x-2">
          {onOK && (
            <button
              onClick={onOK}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ok
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
