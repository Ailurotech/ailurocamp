'use client';

import React, { useState } from 'react';
import PaginationControls from '@/components/ui/PaginationControls';
import Reviews from '@/components/instructor/ReviewsPage/Reviews';
import PopupModal from '@/components/ui/PopupModal';
import { fetchReviews } from '@/lib/instructor/ReviewRequest';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Loading from '@/components/ui/Loading';
import type { GetReviewApiResponse } from '@/types/review';

export default function InstructorReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const courseId: string = React.use(params).id;

  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, error, isPending, isPlaceholderData, refetch } = useQuery<
    GetReviewApiResponse,
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Course Reviews
      </h1>
      <div>
        {isPending ? (
          <Loading />
        ) : error ? (
          <PopupModal
            message="Failed to load reviews, please try again."
            type={'error'}
            onClose={() => {
              refetch();
            }}
          />
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
    </div>
  );
}
