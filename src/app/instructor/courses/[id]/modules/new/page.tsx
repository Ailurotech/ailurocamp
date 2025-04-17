'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PopupModal, { PopupProps } from '@/components/ui/PopupModal';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchModules, createModule } from '@/lib/instructor/ModuleRequest';
import { useRouter } from 'next/navigation';
import InputField from '@/components/instructor/CreateModulePage/InputField';
import TextareaField from '@/components/instructor/CreateModulePage/TextareaField';
import { moduleSchema } from '@/lib/validation/moduleSchema';
import type { IModule } from '@/types/module';

export default function CreateModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const courseId: string = React.use(params).id;

  // Form state
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [order, setOrder] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Popup state
  const [popup, setPopup] = useState<PopupProps | null>(null);

  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Refs for form fields
  const titleRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);
  const orderRef = React.useRef<HTMLInputElement>(null);
  const durationRef = React.useRef<HTMLInputElement>(null);

  // Mapping of form fields names to refs
  const fieldRefs: { [key: string]: React.RefObject<HTMLElement | null> } = {
    title: titleRef,
    content: contentRef,
    order: orderRef,
    duration: durationRef,
  };

  // Fetch existing modules for this course
  const { data: modulesData } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => fetchModules(courseId),
    enabled:
      sessionStatus === 'authenticated' &&
      session.user.currentRole === 'instructor',
  });

  // Default order for a new module
  useEffect(() => {
    if (modulesData && modulesData.modules.length > 0) {
      setOrder(modulesData.modules.length);
    } else {
      setOrder(0);
    }
  }, [modulesData]);

  // Mutation to create a new module for the course
  const createModuleMutation = useMutation({
    mutationFn: (newData: {
      title: string;
      content: string;
      order: number;
      duration: number;
    }) => createModule(courseId, newData),
    onSuccess: () => {
      // reset form
      setTitle('');
      setContent('');
      setOrder(0);
      setDuration(0);

      setPopup({
        message: 'Module created successfully.',
        type: 'success',
        onClose: () => {
          setPopup(null);
          router.push(`/instructor/courses/${courseId}/modules`);
        },
      });
    },
    onError: () => {
      setPopup({
        message: 'Failed to create module, please try again.',
        type: 'error',
        onClose: () => setPopup(null),
      });
    },
  });

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    // Prevent default form submission
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form data
    const result = moduleSchema.safeParse({
      title,
      content,
      order,
      duration,
    });

    // If validation fails, set errors and scroll to first invalid field
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = result.error.errors.reduce(
        (acc: { [key: string]: string }, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        },
        {}
      );
      setErrors(fieldErrors);

      // Define the error order and scroll to the first invalid field
      const errorOrder = ['title', 'content', 'order', 'duration'];
      const firstInvalidField = errorOrder.find(
        (field) => field in fieldErrors
      );
      if (firstInvalidField) {
        const fieldRef = fieldRefs[firstInvalidField];
        if (fieldRef.current) {
          fieldRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          // Focus the first invalid field if it supports focus
          if (typeof fieldRef.current.focus === 'function') {
            fieldRef.current.focus();
          }
        }
      }
      return;
    }

    // Check for duplicate order
    if (modulesData) {
      const existingModule = modulesData.modules.find(
        (module: IModule) => module.order === order
      );
      if (existingModule) {
        setPopup({
          message: 'Duplicate order. Please choose a different order.',
          type: 'error',
          onClose: () => setPopup(null),
        });
        return;
      }
    }

    // If user not logged in, redirect to login page
    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
      setPopup({
        message: 'You must be logged in to create a module.',
        type: 'error',
        onClose: () => {
          router.push('/auth/login');
          setPopup(null);
        },
      });
      return;
    }

    // Send create module request
    createModuleMutation.mutate({
      title,
      content,
      order,
      duration,
    });
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create New Module</h1>
      <div className="max-w-3xl mx-auto">
        {/* Popup Modal */}
        {popup && <PopupModal {...popup} onClose={popup?.onClose} />}

        <form onSubmit={handleSubmit} className="space-y-2">
          <InputField
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            required
          />
          <TextareaField
            label="Content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            error={errors.content}
            required
          />
          <InputField
            label="Order"
            name="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value))}
            error={errors.order}
            required
            min="0"
          />
          <InputField
            label="Duration"
            name="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            error={errors.duration}
            required
            min="0"
            step="0.01"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
