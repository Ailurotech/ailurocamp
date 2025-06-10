'use client';

import React from 'react';
import AssignmentForm from '@/components/assignment/AssignmentForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Loading from '@/components/ui/Loading';

export default function CreateAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const courseId: string = React.use(params).id;
  const router = useRouter();

  // Session and authentication
  const { data: session, status: sessionStatus } = useSession();

  // Check if user is authenticated and is an instructor
  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.currentRole !== 'instructor') {
      router.push('/');
      return;
    }
  }, [session, sessionStatus, router]);

  if (sessionStatus === 'loading') {
    return <Loading />;
  }

  if (!session || session.user.currentRole !== 'instructor') {
    return null; // 重定向已在 useEffect 中处理
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        {/* Navigation */}
        <div className="mb-4">
          <Link 
            href={`/instructor/courses/${courseId}/assignments`} 
            className="text-blue-600 hover:underline"
          >
            ← Back to Assignments
          </Link>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          📚 Create New Assignment
        </h1>

        {/* Assignment Form */}
        <AssignmentForm
          courseId={courseId}
          onSubmit={async () => {
            // 表单已经处理了API调用，这里只需要导航
            router.push(`/instructor/courses/${courseId}/assignments`);
          }}
        />
      </div>
    </div>
  );
}
