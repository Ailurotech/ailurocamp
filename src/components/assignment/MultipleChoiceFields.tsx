'use client';

import React from 'react';
import { useFieldArray, Controller, Control } from 'react-hook-form';
import { Assignment } from '@/types/assignment';

interface Props {
  nestIndex: number;
  control: Control<Assignment>;
}

const MultipleChoiceFields: React.FC<Props> = ({ nestIndex, control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${nestIndex}.choices`,
  });

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded">
      <h3 className="font-semibold mb-2">Choices</h3>
      {fields.map((choice, index) => (
        <div key={choice.id} className="flex items-center gap-2 mb-2">
          <Controller
            name={`questions.${nestIndex}.choices.${index}.label`}
            control={control}
            render={({ field }) => (
              <input {...field} placeholder="Label" className="flex-1 border p-2 rounded" />
            )}
          />
          <Controller
            name={`questions.${nestIndex}.choices.${index}.value`}
            control={control}
            render={({ field }) => (
              <input {...field} placeholder="Value" className="flex-1 border p-2 rounded" />
            )}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-700"
          >
            ❌
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ label: '', value: '' })}
        className="text-blue-600 hover:underline text-sm"
      >
        ➕ Add Choice
      </button>
    </div>
  );
};

export default MultipleChoiceFields;
