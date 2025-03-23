'use client';

import React, { useState } from 'react';
import ModuleForm from '@/components/ui/InstructorModulePage/ModuleForm';
import ErrorPopupModal from '@/components/ui/ErrorPopupModal';
import { useMutation } from '@tanstack/react-query';
import { createModule } from '@/lib/instructor/ModuleRequest';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/Loading';

export default function CreateModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = React.use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Mutation to create a new module for the course.
  const createModuleMutation = useMutation({
    mutationFn: (newData: { title: string; content: string; order: number; duration: number }) =>
      createModule(courseId, newData),
    onSuccess: () => {
      // Redirect to the module list page after successful creation
      router.push(`/instructor/courses/${courseId}/modules`);
    },
    onError: () => {
      setError('Failed to create module.');
    },
  });

  const handleCreateModule = (title: string, content: string, order: number, duration: number) => {
    createModuleMutation.mutate({ title, content, order, duration });
  };

  if (createModuleMutation.isPending) {
    return <Loading />;
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Create New Module</h1>
      <ModuleForm onCreateModule={handleCreateModule} />
      {error && (
        <ErrorPopupModal error={error} onClose={() => setError(null)} />
      )}
    </main>
  );
}
