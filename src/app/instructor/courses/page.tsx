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
import {
  useQuery,
  useMutation,
  keepPreviousData,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchCourses,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
} from '@/lib/instructor/CourseRequest';

interface PopupError {
  errorMsg: string;
  onClose?: () => void;
}

export default function InstructorCoursesPage() {
  // State for a selected course
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);

  // State for editing
  const [editCourse, setEditCourse] = useState<ICourse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // State for deleting
  const [courseToDelete, setCourseToDelete] = useState<ICourse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State for error handling
  const [error, setError] = useState<PopupError | undefined>(undefined);

  // Session
  const { data: session, status: sessionStatus } = useSession();

  const router = useRouter();

  const queryClient = useQueryClient();

  // State for pagination
  const [page, setPage] = useState<number>(1);

  // Check if user is authenticated and is an instructor
  useEffect(() => {
    if (
      sessionStatus !== 'authenticated' ||
      session?.user?.currentRole !== 'instructor'
    ) {
      // Redirect to login page
      router.push('auth/login');
      return;
    }
  }, [session, sessionStatus, router]);

  // Fetch all courses
  const {
    data: fetchedCourses,
    isPending,
    isSuccess,
    isError,
    isPlaceholderData,
  } = useQuery({
    queryKey: ['instructor-courses', session?.user?.id, page],
    queryFn: () => fetchCourses(session?.user?.id, page),
    enabled:
      sessionStatus === 'authenticated' &&
      session?.user?.currentRole === 'instructor',
    placeholderData: keepPreviousData,
  });

  const totalPages: number = fetchedCourses
    ? Math.ceil(fetchedCourses.totalCourses / fetchedCourses.limit)
    : 1;

  // Set the first course as the selected course as default
  useEffect(() => {
    if (isSuccess) {
      if (fetchedCourses.courses.length > 0) {
        setSelectedCourse(fetchedCourses.courses[0]);
      } else {
        setSelectedCourse(null);
      }
    }
  }, [isSuccess, fetchedCourses]);

  // Error handling for fetch courses
  useEffect(() => {
    if (isError) {
      setError({
        errorMsg: 'Failed to load courses, please try again.',
        onClose: () => {
          setError(undefined);
          fetchCourses(session?.user?.id, page);
        },
      });
    }
  }, [isError, session?.user?.id, page]);

  // Edit Course Mutation
  const updateCourseMutation = useMutation({
    mutationFn: (variables: {
      courseId: string;
      changes: { title?: string; description?: string };
    }) => {
      const { courseId, changes } = variables;
      return updateCourse(courseId, changes);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ['instructor-courses'],
      });
      if (selectedCourse?._id === res.updatedResult._id) {
        setSelectedCourse(res.updatedResult);
      }
    },
    onError: () => {
      setError({
        errorMsg: 'Failed to update course, please try again.',
        onClose: () => {
          setError(undefined);
        },
      });
    },
  });

  // Publish/Unpublish Course Mutation
  const updateCourseStatusMutation = useMutation({
    mutationFn: (variables: { courseId: string; newStatus: string }) => {
      const { courseId, newStatus } = variables;
      return updateCourseStatus(courseId, newStatus);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ['instructor-courses'],
      });
      if (selectedCourse?._id === res.updatedResult._id) {
        setSelectedCourse(res.updatedResult);
      }
    },
    onError: () => {
      setError({
        errorMsg: 'Failed to update course status, please try again.',
        onClose: () => {
          setError(undefined);
        },
      });
    },
  });

  // Delete Course Mutation
  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ['instructor-courses'],
      });
      if (selectedCourse?._id === res.deletedResult._id) {
        setSelectedCourse(null);
      }
    },
    onError: () => {
      setError({
        errorMsg: 'Failed to delete course, please try again.',
        onClose: () => {
          setError(undefined);
        },
      });
    },
  });

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

    // Send update request
    updateCourseMutation.mutate({
      courseId: editCourse._id,
      changes: changes,
    });

    // Close the modal
    setIsEditModalOpen(false);
    setEditCourse(null);
  }

  // Publish/unpublish logic
  async function handlePublishToggle(course: ICourse): Promise<void> {
    const newStatus: string =
      course.status === 'published' ? 'unpublished' : 'published';

    // Send update course status request
    updateCourseStatusMutation.mutate({
      courseId: course._id,
      newStatus,
    });
  }

  // Delete logic
  function openDeleteConfirm(course: ICourse): void {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  }

  // Send delete request
  async function handleDeleteCourse(courseId: string): Promise<void> {
    // Send delete request
    deleteCourseMutation.mutate(courseId);

    // Close the modal
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  }

  // Show loading component if courses are being fetched
  if (isPending) {
    return <Loading />;
  }

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Course List */}
      <div className="w-1/2 overflow-y-auto">
        {fetchedCourses && (
          <CourseList
            courses={fetchedCourses.courses}
            selectedCourseId={selectedCourse?._id || null}
            onSelectCourse={(course) => setSelectedCourse(course)}
          />
        )}
        {/* Pagination Controls */}
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          isPlaceholderData={isPlaceholderData}
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
          isSavingEdit={updateCourseMutation.isPending}
          onDelete={openDeleteConfirm}
          isDeleting={deleteCourseMutation.isPending}
          isPublishing={updateCourseStatusMutation.isPending}
        />
      </div>

      {/* Error Popup Modal */}
      <ErrorPopupModal
        error={error?.errorMsg}
        onClose={error?.onClose || (() => {})}
      />

      {/* EDIT MODAL */}
      <EditCourseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditCourse(null);
        }}
        onSaveEdit={handleSaveEdit}
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
      />
    </main>
  );
}
