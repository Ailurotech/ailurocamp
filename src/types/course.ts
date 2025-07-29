export interface ICourse {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail?: string;
  modules: string[];
  enrolledStudents: string[];
  price: number;
  category: string;
  level: string;
  status: 'published' | 'unpublished';
  averageRating: number;
  revenue: number;
  tags: string[];
  ratingCount: number;
  ratingSum: number;
  createdAt: Date;
  updatedAt: Date;
}

// Course interface for frontend display
export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: string;
  price: number;
  averageRating?: number;
  ratingCount?: number;
  enrolledStudents: string[];
  createdAt: string;
}

// Course with detailed modules for course detail page
export interface CourseWithModules {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
  instructor: {
    name: string;
    email: string;
  };
  category: string;
  level: string;
  averageRating: number;
}

// Course with populated instructor for browse page
export interface CourseWithInstructor {
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

// Module interface
export interface Module {
  _id: string;
  title: string;
  content: string;
  duration: number;
  order: number;
}

// Category interface
export interface Category {
  _id: string;
  category: string[];
}

// API related types for courses route
export interface CourseQuery {
  status: string;
  category?: string;
  price?: {
    $gte?: number;
    $lte?: number;
  };
}

export interface SortObject {
  [key: string]: 1 | -1;
}

export interface ICategory {
  _id: string;
  category: string[];
}

export interface ILevel {
  _id: string;
  level: string[];
}

// type for form data when creating a new course
export interface ICourseFormData {
  title: string;
  description: string;
  instructor: string;
  thumbnail: string | null;
  modules?: unknown[];
  enrolledStudents: string[];
  price: number;
  category: ICategory['category'][number];
  level: ILevel['level'][number];
  status: 'published' | 'unpublished';
  averageRating: number;
  revenue: number;
  tags: string[];
}
