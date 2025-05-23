'use client';

import React from 'react';
import AssignmentForm from '@/components/assignment/AssignmentForm';
import { useRouter } from 'next/navigation';

const CreateAssignmentPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          📚 Create New Assignment
        </h1>
        <AssignmentForm
          onSubmit={async (data) => {
            await fetch('/api/assignments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            router.push('/assignments');
          }}
        />
      </div>
    </div>
  );
};

export default CreateAssignmentPage;
