'use client';

import React, { RefObject } from 'react';

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  error?: string;
  selectRef?: RefObject<HTMLSelectElement>;
  required?: boolean;
}

export default function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  selectRef,
  required = false,
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        ref={selectRef}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`mt-1 block w-full p-2 border rounded-md ${
          error ? 'border-red-500' : ''
        }`}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
