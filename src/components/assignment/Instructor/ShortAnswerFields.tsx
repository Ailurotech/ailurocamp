'use client';

import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { Assignment } from '@/types/assignment';

const ShortAnswerFields = ({
  nestIndex,
  control,
}: {
  nestIndex: number;
  control: Control<Assignment>;
}) => {
  return (
    <div className="mt-4 bg-white shadow-md p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-4 text-gray-800">
        Short Answer Question
      </h3>

      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">
          Expected Answer (Optional)
        </label>
        <Controller
          name={`questions.${nestIndex}.correctAnswer`}
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="Enter the expected answer or key points (for grading reference)"
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          )}
        />
        <div className="text-sm text-gray-500 mt-1">
          This will be used as a reference for manual grading
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">
          Instructions/Placeholder (Optional)
        </label>
        <Controller
          name={`questions.${nestIndex}.placeholder`}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="Enter instructions or placeholder text for students"
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        <div className="text-sm text-gray-500 mt-1">
          This text will appear as a placeholder in the answer field
        </div>
      </div>
    </div>
  );
};

export default ShortAnswerFields;
