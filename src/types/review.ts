export interface Review {
  _id: string;
  courseId: string;
  userId: { _id: string; name: string };
  comment?: string;
  rating: number;
  aspectRatings?: {
    contentRating: number;
    instructorRating: number;
    materialsRating: number;
  };
  images?: string[];
  instructorResponse?: string;
  reports?: { userId: string; reason: string; date: Date }[];
  createdAt: string;
  updatedAt: string;
}

export interface GetReviewApiResponse {
  reviews: Review[];
  totalReviews: number;
  page: number;
  limit: number;
}
