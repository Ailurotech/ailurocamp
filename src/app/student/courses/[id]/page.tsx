'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Reviews, {
  ReviewForm,
} from '@/components/instructor/ReviewsPage/Reviews';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: { _id: string; name: string } | string;
  averageRating: number;
}

import type { Review } from '@/types/review';

export default function StudentCourseDetailPage() {
  const { id: courseId } = useParams();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null); // State for the review being edited

  // Fetch course information
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    console.log('Session User ID:', session?.user?.id);
    fetch(`/api/student/course/${courseId}`)
      .then((res) => res.json())
      .then((data) => setCourse(data.course))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseId, session?.user?.id]);

  // Fetch reviews
  useEffect(() => {
    if (!courseId) return;
    setReviewLoading(true);
    setReviewError(null);
    fetch(`/api/review?courseId=${courseId}&page=1`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviewError('Failed to load reviews'))
      .finally(() => setReviewLoading(false));
  }, [courseId]);

  // Submit review
  async function handleReviewSubmit(
    data: Omit<
      Review,
      '_id' | 'userId' | 'updatedAt' | 'instructorResponse' | 'reports' | 'createdAt'
    > & { courseId: string }
  ) {
    if (!courseId || !session?.user) return;
    setReviewLoading(true);
    setReviewError(null);

    const method = editingReview ? 'PUT' : 'POST'; // Determine HTTP method
    const body = editingReview
      ? { ...data, courseId, userId: session.user.id, _id: editingReview._id } // Include _id for PUT
      : { ...data, courseId, userId: session.user.id };

    const res = await fetch('/api/review', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      fetch(`/api/review?courseId=${courseId}&page=1`)
        .then((res) => res.json())
        .then((data) => setReviews(data.reviews || []));
      setEditingReview(null); // Clear editing state on successful submission
    } else {
      setReviewError('Failed to submit review');
    }
    setReviewLoading(false);
  }

  // Report review
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
      fetch(`/api/review?courseId=${courseId}&page=1`)
        .then((res) => res.json())
        .then((data) => setReviews(data.reviews || []));
    } else {
      alert('Failed to report review');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading course...
      </div>
    );
  }
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Course not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="mb-4 text-gray-700">{course.description}</p>
      <div className="mb-6 text-sm text-gray-500">
        Instructor:{' '}
        {typeof course.instructor === 'string'
          ? course.instructor
          : course.instructor?.name || 'Unknown'}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          {editingReview ? 'Edit Your Review' : 'Write a Review'}
        </h2>
        <ReviewForm
          onSubmit={handleReviewSubmit}
          loading={reviewLoading}
          initial={editingReview || undefined}
        />
        {reviewError && <div className="text-red-500 mt-2">{reviewError}</div>}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Course Reviews</h2>
        {reviewLoading ? (
          <div>Loading reviews...</div>
        ) : (
          <Reviews
            reviews={reviews}
            onReport={handleReport}
            onEdit={setEditingReview}
            currentUserId={session?.user?.id}
          />
        )}
      </div>
    </div>
  );
}
