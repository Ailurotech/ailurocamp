'use client';

import React, { Fragment, useState } from 'react';
import PaginationControls from '@/components/ui/PaginationControls';
import Reviews from '@/components/ui/ReviewsPage/Reviews';
import ErrorPopupModal from '@/components/ui/ErrorPopupModal';
import { IReview } from '@/types/review';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

interface ReviewsResponse {
  reviews: IReview[];
  totalReviews: number;
  page: number;
  limit: number;
}

interface ReviewsPageClientProps {
  courseId: string;
}

// Fetch reviews by courseId
const fetchReviews = async (
  courseId: string,
  page: number
): Promise<ReviewsResponse> => {
  const res: Response = await fetch(
    `/api/review?courseId=${courseId}&page=${page}`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch reviews');
  }
  const data: ReviewsResponse = await res.json();
  return data;
};

export default function ReviewsPageClient({
  courseId,
}: ReviewsPageClientProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, error, isPending, isPlaceholderData, refetch } = useQuery<
    ReviewsResponse,
    Error
  >({
    queryKey: ['reviews', courseId, currentPage],
    queryFn: () => fetchReviews(courseId, currentPage),
    placeholderData: keepPreviousData,
  });

  const totalPages: number = Math.ceil(
    (data?.totalReviews || 1) / (data?.limit || 1)
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <div>
        {isPending ? (
          <div>Loading reviews...</div>
        ) : error ? (
          <div>Error loading reviews</div>
        ) : (
          <>
            <Reviews reviews={data?.reviews || []} />
            <PaginationControls
              currentPage={data?.page || 1}
              totalPages={totalPages}
              isPlaceholderData={isPlaceholderData}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Display error popup if an error occurs */}
      {error && (
        <ErrorPopupModal
          error={(error as Error).message}
          onClose={() => {
            refetch();
          }}
        />
      )}
    </>
  );
}
