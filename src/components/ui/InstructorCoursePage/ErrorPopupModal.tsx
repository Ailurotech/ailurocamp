'use client';

import React from 'react';

interface ErrorPopupModalProps {
  error?: string;
  onClose: () => void;
}

const ErrorPopupModal: React.FC<ErrorPopupModalProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-lg p-6 max-w-sm w-full z-50">
        <h3 className="text-lg font-bold text-red-600 mb-4">Error</h3>
        <p className="text-gray-700">{error}</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopupModal;
