import clsx from 'clsx';
import type { ICourse } from '@/types/course';

interface CourseListProps {
  courses: ICourse[];
  selectedCourseId: string | null;
  onSelectCourse: (course: ICourse) => void; // Pass the selected course to the parent
}

export default function CourseList({
  courses,
  selectedCourseId,
  onSelectCourse,
}: CourseListProps) {
  return (
    <div className="h-full border-r border-gray-200 bg-white overflow-y-auto">
      <h2 className="p-4 font-semibold text-lg border-b">Courses</h2>
      <ul>
        {courses.map((course) => (
          <li
            key={course._id}
            className={clsx(
              'cursor-pointer p-3 border-b hover:bg-gray-50',
              selectedCourseId === course._id && 'bg-blue-50'
            )}
            onClick={() => onSelectCourse(course)}
          >
            {course.title}
          </li>
        ))}
        {courses.length === 0 && (
          <li className="p-4 text-center text-sm text-gray-500">
            No courses for now.
          </li>
        )}
      </ul>
    </div>
  );
}
