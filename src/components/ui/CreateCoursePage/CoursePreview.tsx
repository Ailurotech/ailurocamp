'use client';

import React from 'react';
import Image from 'next/image';

interface CoursePreviewProps {
  title: string;
  description: string;
  category: string;
  level: string;
  price: string;
  previewUrl: string | null;
  tags: string;
  status: string;
}

const CoursePreview = React.memo(function CoursePreview({
  title,
  description,
  category,
  level,
  price,
  previewUrl,
  tags,
  status,
}: CoursePreviewProps) {
  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-xl font-bold mb-4">Course Preview</h2>
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">{title || 'Course Title'}</h3>
        <p className="text-gray-700">
          {description || 'Course description will appear here.'}
        </p>
        <p className="text-gray-500">Category: {category || 'N/A'}</p>
        <p className="text-gray-500">Level: {level || 'N/A'}</p>
        <p className="text-gray-500">Price: ${price || '0.00'}</p>
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Thumbnail Preview"
            width={128}
            height={128}
            className="object-cover rounded-md"
          />
        )}
        {tags && (
          <p className="text-gray-500">
            Tags:{' '}
            {tags
              .split(',')
              .map((tag) => tag.trim())
              .join(', ')}
          </p>
        )}
        <p className="text-gray-500">
          Status: {status === 'published' ? 'published' : 'unpublished'}
        </p>
      </div>
    </div>
  );
});

export default CoursePreview;
