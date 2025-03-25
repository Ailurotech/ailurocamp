export interface IReview {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  comment: string;
  rating: number;
  updatedAt: string;
}

export interface GetReviewApiResponse {
  reviews: IReview[];
  totalReviews: number;
  page: number;
  limit: number;
}
