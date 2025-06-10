'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';

export default function DeleteButton({ 
  id, 
  courseId = '6842ba9dfc2972e671d5a48c' 
}: { 
  id: string; 
  courseId?: string;
}) {
  const router = useRouter();
  const adapter = new AssignmentApiAdapter();

  const handleDelete = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete this assignment?'
    );
    if (!confirmed) return;

    try {
      await adapter.deleteAssignment(id, courseId);
      router.push('/assignments');
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      alert('Failed to delete assignment. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      🗑️ Delete
    </button>
  );
}
