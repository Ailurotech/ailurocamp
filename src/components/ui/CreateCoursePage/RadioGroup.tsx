// Radio selection in a form, e.g. published/unpublished
'use client';

import React, { RefObject } from 'react';

interface RadioGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  error?: string;
  containerRef?: RefObject<HTMLDivElement>;
}

export default function RadioGroup({
  label,
  name,
  options,
  selectedValue,
  onChange,
  error,
  containerRef,
}: RadioGroupProps) {
  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1 flex items-center space-x-4" ref={containerRef}>
        {options.map((option) => (
          <label key={option.value} className="inline-flex items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onChange(option.value)}
              className="form-radio"
            />
            <span className="ml-2">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
