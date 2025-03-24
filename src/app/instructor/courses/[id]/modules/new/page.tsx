'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import PopupModal, { PopupProps } from '@/components/ui/PopupModal';
// import ModuleForm from '@/components/ui/InstructorModulePage/ModuleForm';
import { useMutation } from '@tanstack/react-query';
import { createModule } from '@/lib/instructor/ModuleRequest';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
// import Loading from '@/components/ui/Loading';

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

  // Mutation to create a new module for the course.
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
          router.push(`/instructor/courses/${courseId}/modules`);
          setPopup(null);
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

    // Zod schema for validation
    const formSchema = z.object({
      title: z.string().min(1, 'Module title is required'),
      content: z.string().min(1, 'Module content is required'),
      order: z.preprocess(
        (val) => parseInt(val as string),
        z.number().nonnegative('Order must be non-negative')
      ),
      duration: z.preprocess(
        (val) => parseFloat(val as string),
        z.number().nonnegative('Duration must be non-negative')
      ),
    });

    // Validate form data
    const result = formSchema.safeParse({
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

    //   const res = await fetch(`/api/instructor/course/${courseId}/modules`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       title,
    //       content,
    //       order,
    //       duration,
    //     }),
    //   });

    //   if (res.ok) {
    //     // reset form
    //     setTitle('');
    //     setContent('');
    //     setOrder(0);
    //     setDuration(0);

    //     setPopup({
    //       message: 'Module created successfully.',
    //       type: 'success',
    //       onClose: () => {
    //         router.push(`/instructor/courses/${courseId}/modules`);
    //         setPopup(null);
    //       },
    //     });
    //   } else {
    //     setPopup({
    //       message: 'Failed to create module, please try again.',
    //       type: 'error',
    //       onClose: () => setPopup(null),
    //     });
    //   }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create New Module</h1>
      <div className="max-w-3xl mx-auto">
        {/* Popup Modal */}
        {popup && <PopupModal {...popup} onClose={popup?.onClose} />}

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
            {errors && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Content</label>
            <textarea
              className="border rounded p-2 w-full"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            {errors && (
              <p className="text-red-600 text-sm mt-1">{errors.content}</p>
            )}
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
            {errors && (
              <p className="text-red-600 text-sm mt-1">{errors.order}</p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Duration</label>
            <input
              type="number"
              className="border rounded p-2 w-full"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              required
              min={0}
              step={0.01}
            />
            {errors && (
              <p className="text-red-600 text-sm mt-1">{errors.duration}</p>
            )}
          </div>
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
