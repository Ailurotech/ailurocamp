import type { GetReviewApiResponse } from '@/types/review';

// Fetch reviews by courseId
export const fetchReviews = async (
  courseId: string,
  page: number
): Promise<GetReviewApiResponse> => {
  const res: Response = await fetch(
    `/api/review?courseId=${courseId}&page=${page}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch reviews');
  }
  const data: GetReviewApiResponse = await res.json();
  return data;
};
