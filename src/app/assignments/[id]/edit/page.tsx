'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AssignmentForm from '@/components/assignment/AssignmentForm';
import { Assignment } from '@/types/assignment';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';

export default function EditAssignmentPage() {
  const params = useParams();
  const id = params?.id || '';

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        // 使用通用的作业API端点，不需要课程ID
        const response = await fetch(`/api/assignments/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assignment: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success || !result.assignment) {
          throw new Error(result.error || 'Assignment not found');
        }

        // 转换为 Assignment 类型
        const assignment: Assignment = {
          id: result.assignment.id,
          title: result.assignment.title,
          description: result.assignment.description,
          dueDate: result.assignment.dueDate,
          points: result.assignment.points || 100,
          courseId: result.assignment.courseId,
          questions: [],
          timeLimit: 0,
          passingScore: 0,
          createdAt: result.assignment.createdAt || new Date().toISOString(),
          updatedAt: result.assignment.updatedAt || new Date().toISOString(),
        };
        setAssignment(assignment);
      } catch (error) {
        console.error('Failed to fetch assignment:', error);
      }
    };

    if (id) {
      fetchAssignment();
    }
  }, [id]);

  const handleSubmit = async (data: Assignment) => {
    console.log('Submitting data:', data);

    try {
      if (!assignment?.courseId) {
        throw new Error('无法找到课程ID，无法更新作业');
      }

      const adapter = new AssignmentApiAdapter();
      await adapter.updateAssignment(assignment.courseId, id as string, {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        points: data.points || 0
      });
      
      console.log('Update successful, redirecting to:', `/assignments/${id}`);
      router.push(`/assignments/${id}`);
    } catch (error) {
      console.error('Failed to update assignment:', error);
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
