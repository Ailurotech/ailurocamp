import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Review from '@/models/Review';
import type { ICourse } from '@/models/Course';
import type { IReview } from '@/models/Review';
import { z } from 'zod';

// Define a type for review request
interface IReviewApiRequest {
  courseId: string;
  userId: string;
  rating: number;
  comment?: string;
}

// Define a Zod schema for review input validation
const reviewSchema = z.object({
  courseId: z.string().nonempty({ message: 'Course ID is required.' }),
  userId: z.string().nonempty({ message: 'User ID is required.' }),
  rating: z.preprocess(
    (value) => parseFloat(value as string),
    z
      .number()
      .min(0, { message: 'Rating must be at least 0.' })
      .max(10, { message: 'Rating cannot be greater than 10.' })
  ),
  comment: z.string().optional().or(z.literal('')),
});

// Get all reviews
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Get the course ID from the query parameters
    const searchParams: URLSearchParams = req.nextUrl.searchParams;
    const courseId: string | null = searchParams.get('courseId');
    const page: number = parseInt(searchParams.get('page') || '1', 10);
    const limit: number = 10;
    const skip: number = (page - 1) * limit;

    // Get total count of reviews for pagination controls
    const totalReviews: number = await Review.countDocuments({ courseId });

    // Find reviews for the course
    const reviews = await Review.find({ courseId })
      .populate('userId', 'name')
      .select('_id comment rating updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ reviews, totalReviews, page, limit });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch reviews', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Create a review
export async function POST(req: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions);

    // Authenticate the user
    if (!session?.user || session?.user?.currentRole !== 'student') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse the request body
    const body: IReviewApiRequest = await req.json();

    // Check if the required fields are present, comment is optional
    const { courseId, userId, rating, comment }: IReviewApiRequest = body;
    if (!courseId || !userId || !rating) {
      return NextResponse.json(
        { message: 'Missing required fields courseId, uerId or rating.' },
        { status: 400 }
      );
    }

    // Validate the request body
    const parsedBody = reviewSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.error.errors[0].message },
        { status: 400 }
      );
    }

    // Find the course by ID
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found.' },
        { status: 404 }
      );
    }

    // Create a new review
    const review: IReview = new Review({ rating, comment, courseId, userId });
    await review.save();

    // Update the course's rating
    course.ratingCount = (course.ratingCount || 0) + 1;
    course.ratingSum = (course.ratingSum || 0) + rating;
    course.averageRating = course.ratingSum / course.ratingCount;
    await course.save();

    return NextResponse.json(
      { message: 'Review added successfully.', review },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error adding review.', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Update a review
export async function PUT(req: NextRequest) {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user || session?.user?.currentRole !== 'student') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse the request body
    const body: IReview = await req.json();

    // Check if the required fields are present, comment is optional
    const { courseId, userId, rating, comment } = body;
    if (!courseId || !userId || !rating) {
      return NextResponse.json(
        { message: 'Missing required fields courseId, userId or rating.' },
        { status: 400 }
      );
    }

    // Validate the request body
    const parsedBody = reviewSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.error.errors[0].message },
        { status: 400 }
      );
    }

    // Ensure the course exists
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found.' },
        { status: 404 }
      );
    }

    // Find the existing review
    const review: IReview | null = await Review.findOne({ courseId, userId });
    if (!review) {
      return NextResponse.json(
        { message: 'Review not found.' },
        { status: 404 }
      );
    }
    const oldRating: number = review.rating;

    // Update the review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update the course's rating
    course.ratingSum = (course.ratingSum || 0) + rating - oldRating;
    course.averageRating = course.ratingSum / course.ratingCount;
    await course.save();

    return NextResponse.json(
      { message: 'Review updated successfully.', review },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error updating review.', error: (error as Error).message },
      { status: 500 }
    );
  }
}
