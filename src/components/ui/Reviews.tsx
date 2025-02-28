import { IReview } from '@/types/review';

export default function Reviews({ reviews }: { reviews: IReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-gray-500">No reviews yet</p>;
  }

  return (
    <div>
      {reviews.map((review: IReview) => (
        <div key={review._id} className="mb-4 bg-white p-4 shadow rounded-lg">
          <p className="font-semibold">{review.userId.name}</p>
          <p className="text-gray-700">{review.comment}</p>
          <p className="text-sm text-gray-500">Rating: {review.rating}</p>
          <p className="text-sm text-gray-500">
            Date: {new Date(review.updatedAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
