'use client';

import React, { ChangeEvent, RefObject } from 'react';
import Image from 'next/image';

interface FileInputProps {
  label: string;
  fileRef?: RefObject<HTMLInputElement>;
  previewUrl: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export default function FileInput({
  label,
  fileRef,
  previewUrl,
  onChange,
  error,
  required = false,
}: FileInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        ref={fileRef}
        name="thumbnail"
        type="file"
        accept="image/*"
        onChange={onChange}
        className="mt-1 block w-full"
        required={required}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      {previewUrl && (
        <Image
          src={previewUrl}
          alt="Thumbnail Preview"
          width={128}
          height={128}
          className="object-cover rounded-md"
        />
      )}
    </div>
  );
}
