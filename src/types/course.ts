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
