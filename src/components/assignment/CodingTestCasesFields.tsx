'use client';

import React from 'react';
import { useFieldArray, Controller, Control } from 'react-hook-form';
import { Assignment } from '@/types/assignment';

const CodingTestCasesFields = ({
  nestIndex,
  control,
}: {
  nestIndex: number;
  control: Control<Assignment>;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${nestIndex}.testCases`,
    keyName: 'id',
  });

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded">
      <h3 className="font-semibold mb-2">Test Cases</h3>
      {fields.map((testCase, index) => (
        <div key={testCase.id} className="mb-2">
          <Controller
            name={`questions.${nestIndex}.testCases.${index}.input`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder="Input"
                className="w-full border p-2 mb-2 rounded"
              />
            )}
          />
          <Controller
            name={`questions.${nestIndex}.testCases.${index}.output`}
            control={control}
            render={({ field }) => (
              <div>
                <label className="block mb-1 font-medium">Upload Expected Output Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.onChange(file);
                    }
                  }}
                  className="w-full border p-2 rounded"
                />
              </div>
            )}
          />
          <Controller
            name={`questions.${nestIndex}.testCases.${index}.file`}
            control={control}
            render={({ field }) => (
              <div>
                <label className="block mb-1 font-medium">Upload Test Case File</label>
                <input
                  type="file"
                  accept=".json,.txt,.csv.py,.js,.java"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.onChange(file);
                    }
                  }}
                  className="w-full border p-2 rounded"
                />
              </div>
            )}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 hover:underline text-sm mt-1"
            >
              ❌ Remove Test Case
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ input: '', output: '', file: null })}
        className="text-blue-600 hover:underline text-sm mt-2"
      >
        ➕ Add Test Case
      </button>
    </div>
  );
};

export default CodingTestCasesFields;
