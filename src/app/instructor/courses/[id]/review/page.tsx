import ReviewsPageClient from '@/components/ui/ReviewsPage/ReviewsPageClient';

export default async function InstructorReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const courseId: string = (await params).id;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Course Reviews
      </h1>
      <ReviewsPageClient courseId={courseId} />
    </div>
  );
}
