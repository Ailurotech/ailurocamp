import { useState, useEffect } from 'react';

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: { name: string };
  category: string;
  level: string;
  price: number;
}

export interface UseCoursesResult {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCourses = (): UseCoursesResult => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/courses');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('please login first');
        }
        throw new Error('get courses failed');
      }

      const data = await response.json();
      setCourses(data.courses || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'get courses failed');
      
      // 在错误情况下提供备用的测试课程
      setCourses([
        { 
          _id: 'course-001', 
          title: 'test-course-001',
          description: 'test course description',
          instructor: { name: 'test_instructor' },
          category: 'coding',
          level: 'junior',
          price: 0
        },
        { 
          _id: 'course-002', 
          title: 'test-course-002',
          description: 'test course description',
          instructor: { name: 'test_instructor' },
          category: 'coding',
          level: 'middle',
          price: 0
        },
        { 
          _id: 'course-003', 
          title: 'test-course-003',
          description: 'test course description',
          instructor: { name: 'test_instructor' },
          category: 'coding',
          level: 'senior',
          price: 0
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses
  };
};
