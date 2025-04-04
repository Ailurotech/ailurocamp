'use client';

import { useState, useEffect } from 'react';
import { EnrollmentWithDetails } from '@/types';
import {
  fetchEnrollments,
  setEnrollmentLimit,
  generateReport,
  removeStudent,
} from './actions';
import { EnrollmentTable } from '@/components/ui/InstructorStudentsPage/EnrollmentTable';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function StudentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    const getEnrollments = async () => {
      if (userId) {
        const enrollmentsData = await fetchEnrollments(userId);
        setEnrollments(enrollmentsData);
      }
    };
    getEnrollments();
  }, [userId]);

  const filteredEnrollments =
    selectedCourse === 'all'
      ? enrollments
      : enrollments.filter((enroll) => enroll.courseId._id === selectedCourse);

  const handleSetLimit = async (courseId: string, limit: number) => {
    try {
      await setEnrollmentLimit(courseId, limit);
      toast.success(`Setting limit to ${limit} students`);
      const enrollmentsData = await fetchEnrollments(userId!);
      setEnrollments(enrollmentsData);
    } catch (error) {
      toast.error('Error updating enrollment limit');
    }
  };

  const handleRemoveStudent = async (courseId: string, studentId: string) => {
    await removeStudent(userId!, courseId, studentId);
    const enrollmentsData = await fetchEnrollments(userId!);
    setEnrollments(enrollmentsData);
  };

  const handleGenerateReport = async () => {
    try {
      const csvContent = await generateReport(userId!);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enrollment-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Error generating report');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Enrolled Students</h1>
      <EnrollmentTable
        enrollments={filteredEnrollments}
        onSetLimit={handleSetLimit}
        onGenerateReport={handleGenerateReport}
        onRemoveStudent={handleRemoveStudent}
        selectedCourse={selectedCourse}
        onCourseSelect={setSelectedCourse}
      />
    </div>
  );
}
