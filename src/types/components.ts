import { CourseWithInstructor, Category } from './course';

// Browse component props
export interface BrowseCourseCardProps {
  course: CourseWithInstructor;
}

export interface CourseFiltersProps {
  categories: Category[];
  selectedCategory: string;
  priceRange: { min: string; max: string };
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (field: 'min' | 'max', value: string) => void;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

export interface CoursePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
