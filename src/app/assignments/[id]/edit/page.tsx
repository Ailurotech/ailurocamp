'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AssignmentForm from '@/components/assignment/AssignmentForm';
import { Assignment } from '@/types/assignment';

export default function EditAssignmentPage({ params }: { params: { id: string } }) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      const res = await fetch(`/api/assignments/${params.id}`);
      if (!res.ok) {
        console.error('Failed to fetch assignment');
        return;
      }
      const data = await res.json();
      setAssignment(data);
    };

    fetchAssignment();
  }, [params.id]);

  const handleSubmit = async (data: Assignment) => {
    await fetch(`/api/assignments?id=${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.push(`/assignments/${params.id}`);
  };

  if (!assignment) {
    return <div className="p-4 text-gray-600">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">✏️ Edit Assignment</h1>
      <AssignmentForm defaultValues={assignment} onSubmit={handleSubmit} />
    </div>
  );
}
