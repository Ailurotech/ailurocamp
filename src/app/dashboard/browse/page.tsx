'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpenIcon,
  ClockIcon,
  UsersIcon,
  ChevronUpDownIcon,
} from '@/components/ui/Icons';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Array<{
    _id: string;
    title: string;
    duration: number;
    order: number;
  }>;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  level: string;
  averageRating: number;
  price: number;
  createdAt: string;
}

interface Category {
  _id: string;
  category: string[];
}

function BrowseCourseCard({ course }: { course: Course }) {
  const router = useRouter();

  const handleCourseClick = () => {
    router.push(`/dashboard/courses/${course._id}`);
  };

  const handleInstructorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/instructor/${course.instructor._id}`);
  };

  // Calculate total duration from modules
  const totalDuration = course.modules.reduce(
    (total, module) => total + module.duration,
    0
  );

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCourseClick}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span
              className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
              onClick={handleInstructorClick}
            >
              {course.instructor.name}
            </span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {Math.round(totalDuration)} min
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {course.level}
          </span>
          <span className="text-sm font-medium text-gray-900">
            ${course.price}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {course.modules.length} modules
          </span>
          <span className="text-sm text-gray-500">{course.category}</span>
        </div>
      </div>
    </div>
  );
}

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<string>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/category');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory,
        page: currentPage.toString(),
        limit: '12',
        sortBy: sortBy,
      });

      if (priceRange.min) {
        params.append('minPrice', priceRange.min);
      }
      if (priceRange.max) {
        params.append('maxPrice', priceRange.max);
      }

      const response = await fetch(`/api/courses?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data.courses);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, priceRange.min, priceRange.max, sortBy, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    setPriceRange((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setCurrentPage(1);
  };

  const allCategories = categories.flatMap((cat) => cat.category);
  const uniqueCategories = Array.from(new Set(allCategories));

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchCourses}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
            <p className="mt-2 text-gray-600">
              Discover and enroll in courses that interest you
            </p>
          </div>
          <Link
            href="/dashboard/courses"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to My Courses
          </Link>
        </div>

        {/* Filters and Sort */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronUpDownIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range ($)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Title A-Z</option>
              </select>
              <ChevronUpDownIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No courses found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCategory === 'all'
              ? 'No courses are currently available'
              : `No courses found with current filters`}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <BrowseCourseCard key={course._id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
