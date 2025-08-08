'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: { _id: string; name: string } | string;
  enrolledStudents: string[];
  averageRating: number;
}

export default function StudentCoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch('/api/student/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
      })
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  if (loading) {
    return <div className="p-8 text-center">Loading courses...</div>;
  }

  console.log('courses', courses);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Courses</h1>
      {courses.length === 0 ? (
        <div className="text-gray-500">
          You have not enrolled in any courses yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {courses.map((course) => (
            <li key={course._id} className="border rounded p-4 bg-white shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  <p className="text-gray-600">{course.description}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Instructor:{' '}
                    {typeof course.instructor === 'string'
                      ? course.instructor
                      : course.instructor?.name}
                  </p>
                </div>
                <Link
                  href={`/student/courses/${course._id}`}
                  className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Go to Review
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
