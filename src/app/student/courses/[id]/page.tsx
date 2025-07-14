"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Reviews, { ReviewForm } from "@/components/instructor/ReviewsPage/Reviews";

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: { _id: string; name: string } | string;
  averageRating: number;
}

import type { IReview } from "@/types/review";

export default function StudentCourseDetailPage() {
  const { id: courseId } = useParams();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // 获取课程信息
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    fetch(`/api/instructor/course/${courseId}`)
      .then((res) => res.json())
      .then((data) => setCourse(data.course))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  // 获取评价
  useEffect(() => {
    if (!courseId) return;
    setReviewLoading(true);
    setReviewError(null);
    fetch(`/api/review?courseId=${courseId}&page=1`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviewError("Failed to load reviews"))
      .finally(() => setReviewLoading(false));
  }, [courseId]);

  // 提交评价
  async function handleReviewSubmit(data: Omit<IReview, "_id" | "userId" | "updatedAt" | "instructorResponse" | "reports">) {
    if (!courseId || !session?.user) return;
    setReviewLoading(true);
    setReviewError(null);
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, courseId, userId: session.user.id }),
    });
    if (res.ok) {
      fetch(`/api/review?courseId=${courseId}&page=1`)
        .then((res) => res.json())
        .then((data) => setReviews(data.reviews || []));
    } else {
      setReviewError("Failed to submit review");
    }
    setReviewLoading(false);
  }

  // 举报评价
  async function handleReport(reviewId: string) {
    const reason = window.prompt("Please enter the reason for reporting this review:");
    if (!reason) return;
    const res = await fetch("/api/review/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, reason }),
    });
    if (res.ok) {
      fetch(`/api/review?courseId=${courseId}&page=1`)
        .then((res) => res.json())
        .then((data) => setReviews(data.reviews || []));
    } else {
      alert("Failed to report review");
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading course...</div>;
  }
  if (!course) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Course not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="mb-4 text-gray-700">{course.description}</p>
      <div className="mb-6 text-sm text-gray-500">Instructor: {typeof course.instructor === "string" ? course.instructor : course.instructor?.name || "Unknown"}</div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Write a Review</h2>
        <ReviewForm onSubmit={handleReviewSubmit} loading={reviewLoading} />
        {reviewError && <div className="text-red-500 mt-2">{reviewError}</div>}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Course Reviews</h2>
        {reviewLoading ? (
          <div>Loading reviews...</div>
        ) : (
          <Reviews reviews={reviews} onReport={handleReport} />
        )}
      </div>
    </div>
  );
} 