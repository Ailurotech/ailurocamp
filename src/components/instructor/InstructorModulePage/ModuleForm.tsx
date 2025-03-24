'use client';

import React, { useState } from 'react';

interface ModuleFormProps {
  onCreateModule: (
    title: string,
    content: string,
    order: number,
    duration: number
  ) => void;
}

export default function ModuleForm({ onCreateModule }: ModuleFormProps) {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [order, setOrder] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreateModule(title, content, order, duration);
    setTitle('');
    setContent('');
    setOrder(0);
    setDuration(0);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Content</label>
        <textarea
          className="border rounded p-2 w-full"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Order</label>
        <input
          type="number"
          className="border rounded p-2 w-full"
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value))}
          required
          min={0}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Duration</label>
        <input
          type="number"
          className="border rounded p-2 w-full"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          required
          min={0}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create
      </button>
    </form>
  );
}
