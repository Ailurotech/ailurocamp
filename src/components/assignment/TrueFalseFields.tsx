'use client';

import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { Assignment } from '@/types/assignment';

const TrueFalseFields = ({
  nestIndex,
  control,
}: {
  nestIndex: number;
  control: Control<Assignment>;
}) => {
  return (
    <div className="mt-4 bg-white shadow-md p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-4 text-gray-800">
        True/False Question
      </h3>

      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">
          Correct Answer
        </label>
        <Controller
          name={`questions.${nestIndex}.correctAnswer`}
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select correct answer</option>
              <option value="True">True</option>
              <option value="False">False</option>
            </select>
          )}
        />
      </div>
    </div>
  );
};

export default TrueFalseFields;
