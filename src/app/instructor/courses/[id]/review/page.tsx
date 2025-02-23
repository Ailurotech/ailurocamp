import Reviews from "@/components/ui/Reviews"
import { Review } from "@/types/review"

export default async function InstructorReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const courseId: string = (await params).id;

  // Get reviews for the course
  const res: Response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/review?courseId=${courseId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch reviews");
  }

  const data: { reviews: Review[] } = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Course Reviews</h1>
      <Reviews reviews={data.reviews} />
    </div>
  );
}