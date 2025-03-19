import type { ICourse } from '@/types/course';

interface FetchCoursesResponse {
  courses: ICourse[];
  totalCourses: number;
  page: number;
  limit: number;
  error?: string;
}

// Fetch all courses by instructor Id and page number
export async function fetchCourses(
  instructorId: string,
  page: number
): Promise<FetchCoursesResponse> {
  const res: Response = await fetch(
    `/api/instructor/course?instructorId=${instructorId}&page=${page}`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch courses, please try again.');
  }
  const data: FetchCoursesResponse = await res.json();
  return data;
}

// Update a course by course Id
export async function updateCourse(
  courseId: string,
  changes: { title?: string; description?: string }
) {
  const res: Response = await fetch(
    `/api/instructor/course?courseId=${courseId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    }
  );
  if (!res.ok) {
    throw new Error('Failed to update course, please try again.');
  }
  const data: { updatedResult: ICourse; error?: string } = await res.json();
  return data;
}

// Update a course status by course Id
export async function updateCourseStatus(courseId: string, newStatus: string) {
  const res: Response = await fetch(
    `/api/instructor/course?courseId=${courseId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }
  );
  if (!res.ok) {
    throw new Error('Failed to update course status, please try again.');
  }
  const data: { updatedResult: ICourse; error?: string } = await res.json();
  return data;
}

// Delete a course by course Id
export async function deleteCourse(courseId: string) {
  const res: Response = await fetch(
    `/api/instructor/course?courseId=${courseId}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) {
    throw new Error('Failed to delete course, please try again.');
  }
  const data: { deletedResult: ICourse; error?: string } = await res.json();
  return data;
}
