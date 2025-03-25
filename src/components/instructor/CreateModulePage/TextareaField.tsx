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
      <label className="block font-medium mb-1">{label}</label>
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={`border rounded p-2 w-full ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
