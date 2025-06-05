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
    <div className="mt-4 bg-white shadow-md p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-4 text-gray-800">Test Cases</h3>
      {fields.map((testCase, index) => (
        <div key={testCase.id} className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <Controller
            name={`questions.${nestIndex}.testCases.${index}.input`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder="Enter Input"
                className="w-full border border-gray-300 p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          <Controller
            name={`questions.${nestIndex}.testCases.${index}.output`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                placeholder="Expected Output"
                className="w-full border border-gray-300 p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          <Controller
            name={`questions.${nestIndex}.testCases.${index}.file`}
            control={control}
            render={({ field }) => (
              <div>
                <label className="block mb-2 font-medium text-gray-700">Upload Test Case File</label>
                <div
                  className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    const inputElement = document.getElementById(`file-upload-${index}`) as HTMLInputElement | null;
                    if (inputElement) {
                      inputElement.click();
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      field.onChange(file);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    id={`file-upload-${index}`}
                    type="file"
                    accept=".json,.txt,.csv,.py,.js,.java,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('File selected:', file);
                        field.onChange(file);
                      } else {
                        console.warn('No file selected');
                      }
                    }}
                    className="hidden"
                  />
                  <span className="text-gray-500">Drag & drop or click to upload</span>
                </div>
                {field.value && typeof field.value === 'object' && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">Uploaded File: {field.value.name}</p>
                    <button
                      type="button"
                      onClick={() => field.onChange(null)}
                      className="text-red-500 hover:underline text-sm mt-1"
                    >
                      ❌ Remove File
                    </button>
                  </div>
                )}
              </div>
            )}
          />
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 hover:underline text-sm"
            >
              ❌ Remove Test Case
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ input: '', output: '', file: null })}
        className="text-blue-600 hover:underline text-sm mt-4"
      >
        ➕ Add Test Case
      </button>
    </div>
  );
};

export default CodingTestCasesFields;
