'use client';

import { useEffect, useState } from 'react';
import CourseList from '@/components/ui/InstructorCoursePage/CourseList';
import CourseCard from '@/components/ui/InstructorCoursePage/CourseCard';
import Loading from '@/components/ui/Loading';
import type { ICourse } from '@/types/course';
import {useSession} from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PaginationControls from '@/components/ui/InstructorCoursePage/PaginationControls';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);

  // State for editing
  const [editCourse, setEditCourse] = useState<ICourse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // State for deleting
  const [courseToDelete, setCourseToDelete] = useState<ICourse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for publish/unpublish
  const [isPublishing, setIsPublishing] = useState(false);

  // State for error handling
  const [error, setError] = useState<string | undefined>(undefined);

  // Session
  const { data: session, status: sessionStatus } = useSession();

  const router = useRouter();

  // State for pagination
  const [page, setPage] = useState<number>(1);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);

  const totalPages: number = Math.ceil(totalCourses / limit);

  // Fetch all courses
  useEffect(() => {
    async function fetchCourses(): Promise<void> {
      setLoadingCourses(true);
      try {
        if (sessionStatus !== 'authenticated' || session?.user?.currentRole !== 'instructor') {
          // Redirect to login page
          router.push('auth/login');
          return;
        }

        const res: Response = await fetch(`/api/instructor/course?instructorId=${session.user.id}&page=${page}`);
        const data: { courses: ICourse[]; totalCourses: number; page: number; limit: number; error?: string } = await res.json();
        if (!res.ok) {
          console.error(data.error);
          setError('Failed to load courses, please try again.');
          return;
        }
        setLimit(data.limit);
        setCourses(data.courses);
        setTotalCourses(data.totalCourses);

        // Set the first course as the selected course as default
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0]);
        }
      } catch (error: unknown) {
        console.error('Failed to fetch courses', error);
        setError('Failed to load courses, please try again.');
      } finally {
        setLoadingCourses(false);
      }
    }

    fetchCourses();
  }, [page, session, sessionStatus]);

  // Edit logic
  function openEditModal(course: ICourse): void {
    setEditCourse(course);
    setEditTitle(course.title);
    setEditDesc(course.description);
    setIsEditModalOpen(true);
  }

  // Save edited course
  async function handleSaveEdit(): Promise<void> {
    if (!editCourse) return;

    // Check if there are any changes
    const changes: { title?: string; description?: string } = {};
    if (editCourse.title !== editTitle) {
      changes.title = editTitle;
    }
    if (editCourse.description !== editDesc) {
      changes.description = editDesc;
    }

    // If there are no changes, close the modal
    if (Object.keys(changes).length === 0) {
      setIsEditModalOpen(false);
      setEditCourse(null);
      return;
    }

    // If there are changes, update the course
    setIsSavingEdit(true);
    try {
      const res: Response = await fetch(`/api/instructor/course/${editCourse._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      const data: { updatedResult: ICourse; error?: string } = await res.json();
      if (!res.ok) {
        console.log(data.error);
        setError('Failed to update course, please try again.');
      } else {
        const updated: ICourse = data.updatedResult;
        // updated = {
        //   ...updated,
        //   id: updated._id.toString(),
        //   enrolledStudents: updated.enrolledStudents?.length ?? 0,
        // };
        setCourses((prev: ICourse[]) =>
          prev.map((c) => (c._id === updated._id ? updated : c))
        );
        if (selectedCourse?._id === updated._id) {
          setSelectedCourse(updated);
        }
      }
    } catch (error: unknown) {
      console.error('Error updating course:', error);
      setError('Failed to update course, please try again.');
    } finally {
      setIsSavingEdit(false);
      setIsEditModalOpen(false);
      setEditCourse(null);
    }
  }

  // Publish/unpublish logic
  async function handlePublishToggle(course: ICourse): Promise<void> {
    const newStatus: string =
      course.status === 'published' ? 'unpublished' : 'published';
    setIsPublishing(true);
    try {
      const res: Response = await fetch(`/api/instructor/course/${course._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data: { updatedResult: ICourse; error?: string } = await res.json();
      if (!res.ok) {
        console.log(data.error);
        setError(`Failed to ${newStatus} this course, please try again.`);
      } else {
        const updated: ICourse = data.updatedResult;
        // updated = {
        //   ...updated,
        //   id: updated._id.toString(),
        //   enrolledStudents: updated.enrolledStudents?.length ?? 0,
        // };
        setCourses((prev: ICourse[]) =>
          prev.map((c) => (c._id === updated._id ? updated : c))
        );
        if (selectedCourse?._id === updated._id) {
          setSelectedCourse(updated);
        }
      }
    } catch (error: unknown) {
      console.error('Error publishing course:', error);
      setError(`Failed to ${newStatus} this course, please try again.`);
    } finally {
      setIsPublishing(false);
    }
  }

  // Delete logic
  function openDeleteConfirm(course: ICourse): void {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  }

  // Send delete request
  async function handleDeleteCourse(courseId: string): Promise<void> {
    setIsDeleting(true);
    try {
      const res: Response = await fetch(`/api/instructor/course/${courseId}`, {
        method: 'DELETE',
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        console.log(data.error);
        setError('Failed to delete course, please try again.');
      } else {
        setCourses((prev: ICourse[]) => prev.filter((c) => c._id !== courseId));
        // Remove the deleted course from the selected course if it was selected
        if (selectedCourse?._id === courseId) {
          const remaining: ICourse[] = courses.filter(
            (c) => c._id !== courseId
          );
          setSelectedCourse(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (error: unknown) {
      console.error('Error deleting course:', error);
      setError('Failed to delete course, please try again.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  }

  // Show loading component if courses are being fetched
  if (loadingCourses) {
    return <Loading />;
  }

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Course List */}
      <div className="w-1/2 overflow-y-auto">
        <CourseList
          courses={courses}
          selectedCourseId={selectedCourse?._id || null}
          onSelectCourse={(course) => setSelectedCourse(course)}
        />
        {/* Pagination Controls */}
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Course Card */}
      <div className="w-1/2 overflow-y-auto bg-gray-50">
        <CourseCard
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onPublishToggle={handlePublishToggle}
          onEdit={openEditModal}
          onDelete={openDeleteConfirm}
          isPublishing={isPublishing}
        />
      </div>

      {/* Error Popup Modal */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black opacity-40"
            onClick={() => setError(undefined)}
          ></div>
          {/* Modal */}
          <div className="bg-white rounded-lg p-6 max-w-sm w-full z-50">
            <h3 className="text-lg font-bold text-red-600 mb-4">Error</h3>
            <p className="text-gray-700">{error}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setError(undefined)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
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
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-lg resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditCourse(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
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
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCourse(courseToDelete._id)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
