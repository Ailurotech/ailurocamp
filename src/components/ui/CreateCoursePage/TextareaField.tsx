'use client';

import React, { ChangeEvent, RefObject } from 'react';

interface TextareaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}

export default function TextareaField({
  label,
  name,
  value,
  onChange,
  error,
  textareaRef,
  rows = 4,
  required = false,
  placeholder,
}: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={`mt-1 block w-full p-2 border rounded-md resize-none ${
          error ? 'border-red-500' : ''
        }`}
      />
      {error && (
        <p className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
