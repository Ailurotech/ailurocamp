'use client';

import React, { useEffect, useState } from 'react';
import PaginationControls from '@/components/ui/PaginationControls';
import Reviews from '@/components/ui/ReviewsPage/Reviews';
import ErrorPopupModal from '@/components/ui/ErrorPopupModal';
import { IReview } from '@/types/review';

interface ReviewsResponse {
  reviews: IReview[];
  totalReviews: number;
  page: number;
  limit: number;
}

interface ReviewsPageClientProps {
  courseId: string;
}

export default function ReviewsPageClient({
  courseId,
}: ReviewsPageClientProps) {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(1);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  const totalPages: number = Math.ceil(totalReviews / limit);

  // State for error handling
  const [error, setError] = useState<string | undefined>(undefined);

  // Fetch reviews on currentPage or courseId change
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res: Response = await fetch(
          `/api/review?courseId=${courseId}&page=${currentPage}`
        );
        const data: ReviewsResponse = await res.json();
        setReviews(data.reviews);
        setLimit(data.limit);
        setCurrentPage(data.page);
        setTotalReviews(data.totalReviews);
      } catch {
        setError('Failed to fetch reviews, please try again.');
        return;
      }
    };

    fetchReviews();
  }, [courseId, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <div>
        <Reviews reviews={reviews} />
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Error Popup Modal */}
      <ErrorPopupModal
        error={error}
        onClose={() => {
          setError(undefined);
          window.location.reload();
        }}
      />
    </>
  );
}
