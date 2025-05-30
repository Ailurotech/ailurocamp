'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AssignmentForm from '@/components/assignment/AssignmentForm';
import { Assignment } from '@/types/assignment';

export default function EditAssignmentPage() {
  const params = useParams();
  const id = params?.id || '';

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      const res = await fetch(`/api/assignments/${id}`);
      if (!res.ok) {
        console.error('Failed to fetch assignment');
        return;
      }
      const data = await res.json();
      setAssignment(data);
    };

    fetchAssignment();
  }, [id]);

  const handleSubmit = async (data: Assignment) => {
    console.log('Submitting data:', data);

    const res = await fetch(`/api/assignments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      console.log('Update successful, redirecting to:', `/assignments/${id}`);
      const responseBody = await res.json();
      console.log('API Response:', responseBody);
      router.push(`/assignments/${id}`);
    } else {
      const errorText = await res.text();
      console.error('Failed to update assignment:', errorText);
    }
  };

  if (!assignment) {
    return <div className="p-4 text-gray-600">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="mb-4">
        <Link
          href={`/assignments/${id}`}
          className="text-blue-600 hover:underline"
        >
          ← Return to Assignment Details
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">✏️ Edit Assignment</h1>
      <AssignmentForm defaultValues={assignment} onSubmit={handleSubmit} />
    </div>
  );
}
