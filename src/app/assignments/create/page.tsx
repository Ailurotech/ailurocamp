'use client';

import React from 'react';
import AssignmentForm from '@/components/assignment/AssignmentForm';
import { Assignment } from '@/types/assignment';
import { useRouter } from 'next/navigation';

const CreateAssignmentPage: React.FC = () => {
  const router = useRouter();

  const handleFormSubmit = async (data: Assignment) => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      const result = await response.json();
      console.log('Assignment created:', result);
      router.push('/assignments');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">📚 Create New Assignment</h1>
        <AssignmentForm onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
};

export default CreateAssignmentPage;
