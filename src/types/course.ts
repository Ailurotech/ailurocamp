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
