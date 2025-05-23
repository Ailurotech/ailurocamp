'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete this assignment?'
    );
    if (!confirmed) return;

    await fetch(`/api/assignments?id=${id}`, { method: 'DELETE' });
    router.push('/assignments');
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
