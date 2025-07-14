export interface IReview {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  comment: string;
  rating: number;
  aspectRatings?: {
    content: number;
    instructor: number;
    materials: number;
  };
  images?: string[];
  instructorResponse?: string;
  reports?: { userId: string; reason: string; date: string }[];
  updatedAt: string;
}

export interface GetReviewApiResponse {
  reviews: IReview[];
  totalReviews: number;
  page: number;
  limit: number;
}
