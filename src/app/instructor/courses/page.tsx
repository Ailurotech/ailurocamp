'use client';

import { useEffect, useState } from 'react';
import CourseList from '@/components/ui/InstructorCoursePage/CourseList';
import CourseCard from '@/components/ui/InstructorCoursePage/CourseCard';
import EditCourseModal from '@/components/ui/InstructorCoursePage/EditCourseModal';
import DeleteCourseModal from '@/components/ui/InstructorCoursePage/DeleteCourseModal';
import ErrorPopupModal from '@/components/ui/ErrorPopupModal';
import PaginationControls from '@/components/ui/PaginationControls';
import Loading from '@/components/ui/Loading';
import type { ICourse } from '@/types/course';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
        if (
          sessionStatus !== 'authenticated' ||
          session?.user?.currentRole !== 'instructor'
        ) {
          // Redirect to login page
          router.push('auth/login');
          return;
        }

        const res: Response = await fetch(
          `/api/instructor/course?instructorId=${session.user.id}&page=${page}`
        );
        const data: {
          courses: ICourse[];
          totalCourses: number;
          page: number;
          limit: number;
          error?: string;
        } = await res.json();
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
      const res: Response = await fetch(
        `/api/instructor/course?courseId=${editCourse._id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes),
        }
      );
      const data: { updatedResult: ICourse; error?: string } = await res.json();
      if (!res.ok) {
        console.log(data.error);
        setError('Failed to update course, please try again.');
      } else {
        const updated: ICourse = data.updatedResult;
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
      const res: Response = await fetch(
        `/api/instructor/course?courseId=${course._id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data: { updatedResult: ICourse; error?: string } = await res.json();
      if (!res.ok) {
        console.log(data.error);
        setError(`Failed to ${newStatus} this course, please try again.`);
      } else {
        const updated: ICourse = data.updatedResult;
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
      const res: Response = await fetch(
        `/api/instructor/course?courseId=${courseId}`,
        {
          method: 'DELETE',
        }
      );
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
      <ErrorPopupModal error={error} onClose={() => setError(undefined)} />

      {/* EDIT MODAL */}
      <EditCourseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditCourse(null);
        }}
        onSaveEdit={handleSaveEdit}
        isSavingEdit={isSavingEdit}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
      />

      {/* DELETE MODAL */}
      <DeleteCourseModal
        isOpen={isDeleteModalOpen}
        courseToDelete={courseToDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteCourse}
        isDeleting={isDeleting}
      />
    </main>
  );
}
