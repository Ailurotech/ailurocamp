'use client';

import React, { RefObject } from 'react';

interface InputFieldProps {
  label: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  inputRef?: RefObject<HTMLInputElement>;
  placeholder?: string;
  min?: string;
  step?: string;
  helperText?: string;
  required?: boolean;
}

export default function InputField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  inputRef,
  placeholder,
  min,
  step,
  helperText,
  required = false,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        ref={inputRef}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        required={required}
        className={`border rounded p-2 w-full ${error ? 'border-red-500' : ''}`}
      />
      {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
