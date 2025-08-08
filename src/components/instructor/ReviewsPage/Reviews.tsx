import { IReview } from '@/types/review';
import React, { useState } from 'react';
import Image from 'next/image';

export function ReviewForm({
  initial,
  onSubmit,
  loading,
}: {
  initial?: Partial<IReview>;
  onSubmit: (
    data: Omit<
      IReview,
      '_id' | 'userId' | 'updatedAt' | 'instructorResponse' | 'reports'
    >
  ) => void;
  loading?: boolean;
}) {
  const [rating, setRating] = useState(initial?.rating || 5);
  const [aspectRatings, setAspectRatings] = useState(
    initial?.aspectRatings || { content: 5, instructor: 5, materials: 5 }
  );
  const [comment, setComment] = useState(initial?.comment || '');
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [imgInput, setImgInput] = useState('');

  function handleAspectChange(key: keyof typeof aspectRatings, value: number) {
    setAspectRatings({ ...aspectRatings, [key]: value });
  }

  function handleAddImage() {
    if (imgInput && !images.includes(imgInput)) {
      setImages([...images, imgInput]);
      setImgInput('');
    }
  }

  function handleRemoveImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ rating, aspectRatings, comment, images });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 bg-gray-50 rounded shadow"
    >
      <div className="mb-2">
        <label className="block font-semibold mb-1">Overall Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Content Quality</label>
        <StarRating
          value={aspectRatings.content}
          onChange={(v) => handleAspectChange('content', v)}
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Instructor Quality</label>
        <StarRating
          value={aspectRatings.instructor}
          onChange={(v) => handleAspectChange('instructor', v)}
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Materials Quality</label>
        <StarRating
          value={aspectRatings.materials}
          onChange={(v) => handleAspectChange('materials', v)}
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Comment</label>
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Image URLs</label>
        <div className="flex gap-2 mb-1">
          <input
            className="border rounded px-2 py-1 flex-1"
            value={imgInput}
            onChange={(e) => setImgInput(e.target.value)}
            placeholder="Paste image URL and click Add"
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-2 rounded"
            onClick={handleAddImage}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <Image
                src={img}
                alt="review-img"
                className="w-16 h-16 object-cover rounded border"
                width={64}
                height={64}
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded px-1 opacity-80 group-hover:opacity-100"
                onClick={() => handleRemoveImage(idx)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="mt-2 bg-green-600 text-white px-4 py-1 rounded disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={
            'text-xl' + (star <= value ? ' text-yellow-400' : ' text-gray-300')
          }
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export default function Reviews({
  reviews,
  onReport,
  onReply,
  onEdit,
  currentUserId,
}: {
  reviews: IReview[];
  onReport?: (reviewId: string) => void;
  onReply?: (reviewId: string, response: string) => void;
  onEdit?: (review: IReview) => void;
  currentUserId?: string;
}) {
  if (reviews.length === 0) {
    return <p className="text-gray-500">No reviews yet</p>;
  }

  return (
    <div>
      {reviews.map((review: IReview) => (
        <div key={review._id} className="mb-4 bg-white p-4 shadow rounded-lg">
          {/* Temporarily logging review.userId._id for debugging */}
          {(console.log('Review User ID:', review.userId._id), null)}
          <p className="font-semibold">{review.userId.name}</p>
          <p className="text-gray-700">{review.comment}</p>
          <p className="text-sm text-gray-500">Rating: {review.rating} / 5</p>
          {review.aspectRatings && (
            <div className="text-xs text-gray-600 mt-1">
              <span>Content: {review.aspectRatings.content} / 5</span>
              {' | '}
              <span>Instructor: {review.aspectRatings.instructor} / 5</span>
              {' | '}
              <span>Materials: {review.aspectRatings.materials} / 5</span>
            </div>
          )}
          {review.images && review.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {review.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt="review-img"
                  className="w-20 h-20 object-cover rounded border"
                  width={80}
                  height={80}
                />
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Date: {new Date(review.updatedAt).toLocaleString()}
          </p>
          {review.instructorResponse && (
            <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
              <span className="font-semibold text-blue-700">
                Instructor Reply:
              </span>
              <span className="ml-2 text-gray-800">
                {review.instructorResponse}
              </span>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            {onReport && (
              <button
                className="text-xs text-red-500 hover:underline"
                onClick={() => onReport(review._id)}
              >
                Report
              </button>
            )}
            {onEdit && currentUserId === review.userId._id && (
              <button
                className="text-xs text-blue-500 hover:underline"
                onClick={() => onEdit(review)}
              >
                Edit
              </button>
            )}
            {onReply && <ReplyBox reviewId={review._id} onReply={onReply} />}
          </div>
          {review.reports && review.reports.length > 0 && (
            <div className="mt-1 text-xs text-red-400">
              Reported {review.reports.length} times
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ReplyBox({
  reviewId,
  onReply,
}: {
  reviewId: string;
  onReply: (reviewId: string, response: string) => void;
}) {
  const [show, setShow] = React.useState(false);
  const [value, setValue] = React.useState('');
  return (
    <span>
      <button
        className="text-xs text-blue-500 hover:underline"
        onClick={() => setShow((s) => !s)}
      >
        {show ? 'Cancel' : 'Reply'}
      </button>
      {show && (
        <span className="ml-2">
          <input
            className="border px-1 py-0.5 text-xs rounded"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Reply..."
          />
          <button
            className="ml-1 text-xs text-green-600 hover:underline"
            onClick={() => {
              onReply(reviewId, value);
              setValue('');
              setShow(false);
            }}
            disabled={!value.trim()}
          >
            Send
          </button>
        </span>
      )}
    </span>
  );
}
