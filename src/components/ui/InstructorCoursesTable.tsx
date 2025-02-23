'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { ICourse } from '@/models/Course';
import mongoose from 'mongoose';
import { useRouter } from 'next/navigation';

type Course = {
  id: string;
  title: string;
  enrolledStudents: number;
  averageRating: number;
  revenue: number;
  description: string;
  status: 'published' | 'unpublished';
};

interface InstructorCoursesTableProps {
  initialCourses: ICourse[];
}

export default function InstructorCoursesTable({
  initialCourses,
}: InstructorCoursesTableProps) {
  const [courses, setCourses] = useState<Course[]>(
    initialCourses.map((course) => ({
      ...course,
      id: (course._id as mongoose.Types.ObjectId).toString(),
      enrolledStudents: course.enrolledStudents
        ? course.enrolledStudents.length
        : 0,
    }))
  );

  // State for Edit Modal
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editdTitle, setEditdTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  // State for Delete Confirmation
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const router = useRouter();

  // Click Edit modal handler
  const handleClickEdit = async (course: Course) => {
    setEditCourse(course);
    setEditdTitle(course.title);
    setEditedDescription(course.description);
    setIsEditModalOpen(true);
  };

  // Save Edited Course Changes
  const saveEditedCourse = async () => {
    if (!editCourse) return;

    // Determine whether fields have changed or not
    const changes: { title?: string; description?: string } = {};
    if (editCourse.title !== editdTitle) {
      changes.title = editdTitle;
    }
    if (editCourse.description !== editedDescription) {
      changes.description = editedDescription;
    }

    // If no changes, close the modal
    if (Object.keys(changes).length === 0) {
      setIsEditModalOpen(false);
      setEditCourse(null);
      return;
    }

    // If changes, send request to update the course
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/course/${editCourse.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes),
      }
    );
    const data = await res.json();
    console.log('data', data);

    // If there is an error
    if (!res.ok) {
      console.log(data.error);
    } else {
      // If no error
      let updatedCourse = data.updatedResult;
      updatedCourse = {
        ...updatedCourse,
        id: (updatedCourse._id as mongoose.Types.ObjectId).toString(),
        enrolledStudents: updatedCourse.enrolledStudents
          ? updatedCourse.enrolledStudents.length
          : 0,
      };
      setCourses((prev) =>
        prev.map((prevCourse) =>
          prevCourse.id === editCourse.id ? updatedCourse : prevCourse
        )
      );
      setIsEditModalOpen(false);
      setEditCourse(null);
    }
  };

  // Toggle Publish/Unpublish
  const handlePublishToggle = async (course: Course) => {
    // Send request to update the course
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/course/${course.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: course.status === 'published' ? 'unpublished' : 'published',
        }),
      }
    );
    const data = await res.json();
    console.log('data', data);

    // If there is an error
    if (!res.ok) {
      console.log(data.error);
    } else {
      // If no error
      let updatedCourse = data.updatedResult;
      updatedCourse = {
        ...updatedCourse,
        id: (updatedCourse._id as mongoose.Types.ObjectId).toString(),
        enrolledStudents: updatedCourse.enrolledStudents
          ? updatedCourse.enrolledStudents.length
          : 0,
      };
      setCourses((prev) =>
        prev.map((prevCourse) =>
          prevCourse.id === course.id ? updatedCourse : prevCourse
        )
      );
    }
  };

  // Open Delete Confirmation
  const handleDeleteConfirm = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  // Delete a course
  const deleteCourse = async (courseId: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/course/${courseId}`,
      {
        method: 'DELETE',
      }
    );
    const data = await res.json();

    // If there is an error
    if (!res.ok) {
      console.log(data.error);
    } else {
      // If no error
      setCourses((prev) =>
        prev.filter((prevCourse) => prevCourse.id !== courseId)
      );
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  return (
    <>
      {/* Courses Table */}
      <div className="overflow-x-auto w-full bg-white shadow rounded-lg absolute">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Course
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Students
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Average Rating
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Revenue
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reviews
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {course.title}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {course.enrolledStudents}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {course.averageRating.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  ${course.revenue}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() =>
                      router.push(`/instructor/courses/${course.id}/review`)
                    }
                    className="text-blue-500 hover:underline"
                  >
                    View Reviews
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      'inline-flex px-2 text-xs font-semibold rounded-full',
                      course.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => handleClickEdit(course)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePublishToggle(course)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {course.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(course)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-3 text-center text-sm text-gray-500"
                >
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editCourse && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Course
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Title
                </label>
                <input
                  type="text"
                  value={editdTitle}
                  className="mt-1 w-full p-2 border rounded-lg"
                  onChange={(e) => setEditdTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Description
                </label>
                <textarea
                  className="mt-1 w-full p-2 border rounded-lg resize-none"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditCourse(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={saveEditedCourse}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && courseToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Confirmation
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{' '}
              <strong>{courseToDelete.title}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => deleteCourse(courseToDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
