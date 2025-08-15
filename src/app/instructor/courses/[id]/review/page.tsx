'use client';

import React, { useState } from 'react';
import PaginationControls from '@/components/ui/PaginationControls';
import Reviews from '@/components/instructor/ReviewsPage/Reviews';
import PopupModal from '@/components/ui/PopupModal';
import { fetchReviews } from '@/lib/instructor/ReviewRequest';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Loading from '@/components/ui/Loading';
import type { GetReviewApiResponse } from '@/types/review';
import { useSession } from 'next-auth/react';

export default function InstructorReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const courseId: string = React.use(params).id;
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [popup, setPopup] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

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

  // Report functionality
  async function handleReport(reviewId: string) {
    const reason = window.prompt(
      'Please enter the reason for reporting this review:'
    );
    if (!reason) return;
    const res = await fetch('/api/review/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, reason }),
    });
    if (res.ok) {
      setPopup({ message: 'Reported successfully', type: 'success' });
      refetch();
    } else {
      setPopup({ message: 'Failed to report review', type: 'error' });
    }
  }

  // Instructor reply functionality
  async function handleReply(reviewId: string, response: string) {
    if (!response) return;
    const res = await fetch('/api/review', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, instructorResponse: response }),
    });
    if (res.ok) {
      setPopup({ message: 'Reply sent', type: 'success' });
      refetch();
    } else {
      setPopup({ message: 'Failed to send reply', type: 'error' });
    }
  }

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
            {popup && (
              <PopupModal
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup(null)}
              />
            )}
            <Reviews
              reviews={data?.reviews || []}
              onReport={handleReport}
              onReply={
                session?.user?.currentRole === 'instructor'
                  ? handleReply
                  : undefined
              }
            />
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
