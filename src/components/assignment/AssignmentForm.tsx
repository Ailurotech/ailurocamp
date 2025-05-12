'use client';

import React from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { Assignment } from '@/types/assignment';
import MultipleChoiceFields from './MultipleChoiceFields';
import CodingTestCasesFields from './CodingTestCasesFields';

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
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchedQuestions = useWatch({
    control,
    name: 'questions',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Assignment Title */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Title</label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input {...field} className="border p-2 w-full rounded" placeholder="Assignment Title" />
          )}
        />
      </div>

      {/* Assignment Description */}
      <div className="mb-8">
        <label className="block mb-1 font-medium">Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea {...field} className="border p-2 w-full rounded" placeholder="Assignment Description" />
          )}
        />
      </div>

      {/* Questions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Questions</h2>
          <button
            type="button"
            onClick={() =>
              append({
                id: Date.now().toString(),
                title: '',
                type: 'multiple-choice',
                points: 0,
              })
            }
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            ➕ Add Question
          </button>
        </div>

        {fields.map((field, index) => {
          const watchedType = watchedQuestions?.[index]?.type;

          return (
            <div key={field.id} className="border p-4 rounded mb-6">
              {/* Question Title */}
              <label className="block mb-1 font-medium">Question Title</label>
              <Controller
                name={`questions.${index}.title`}
                control={control}
                render={({ field }) => (
                  <input {...field} className="border p-2 w-full mb-2 rounded" placeholder="Question Title" />
                )}
              />

              {/* Question Points */}
              <label className="block mb-1 font-medium">Points</label>
              <Controller
                name={`questions.${index}.points`}
                control={control}
                render={({ field }) => (
                  <input {...field} type="number" className="border p-2 w-full mb-2 rounded" placeholder="Points" />
                )}
              />

              {/* Question Type */}
              <label className="block mb-1 font-medium">Type</label>
              <Controller
                name={`questions.${index}.type`}
                control={control}
                render={({ field }) => (
                  <select {...field} className="border p-2 w-full mb-4 rounded">
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="coding">Coding</option>
                    <option value="file-upload">File Upload</option>
                    <option value="essay">Essay</option>
                  </select>
                )}
              />

              {/* Dynamic fields based on type */}
              {watchedType === 'multiple-choice' && (
                <MultipleChoiceFields nestIndex={index} control={control} />
              )}
              {watchedType === 'coding' && (
                <CodingTestCasesFields nestIndex={index} control={control} />
              )}
              {watchedType === 'file-upload' && (
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <label className="block mb-1 font-medium">Allowed File Type</label>
                  <Controller
                    name={`questions.${index}.fileType`}
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="border p-2 w-full rounded">
                        <option value="">Select file type</option>
                        <option value="pdf">PDF</option>
                        <option value="word">Word Document</option>
                        <option value="zip">ZIP Archive</option>
                        <option value="other">Other</option>
                      </select>
                    )}
                  />
                </div>
              )}

              {/* Remove Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:underline mt-2"
                >
                  ❌ Remove Question
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  );
};

export default AssignmentForm;
