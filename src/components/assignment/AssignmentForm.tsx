'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Assignment } from '@/types/assignment';

const AssignmentForm: React.FC<{ onSubmit: (data: Assignment) => void }> = ({ onSubmit }) => {
  const { control, handleSubmit } = useForm<Assignment>({
    defaultValues: {
      title: '',
      description: '',
      questions: [],
      dueDate: '',
      timeLimit: 0,
      passingScore: 0,
      createdAt: '',
      updatedAt: '',
      id: '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Title Input */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700 mb-1">Title</label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter assignment title"
            />
          )}
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label className="block font-medium text-gray-700 mb-1">Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter assignment description"
            />
          )}
        />
      </div>

      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  );
};

export default AssignmentForm;
