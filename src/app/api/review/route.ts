import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Review from '@/models/Review';
import { z } from 'zod';

// Define a Zod schema for review input validation
const reviewSchema = z.object({
  courseId: z.string().nonempty({ message: 'Course ID is required.' }),
  userId: z.string().nonempty({ message: 'User ID is required.' }),
  rating: z.preprocess(
    (value) => parseFloat(value as string),
    z
      .number()
      .min(0, { message: 'Rating must be at least 0.' })
      .max(10, { message: 'Rating cannot be greater than 5.' })
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

    // Find reviews for the course
    const reviews = await Review.find({ courseId })
      .populate('userId', 'name')
      .select('_id comment rating updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Create a review
export async function POST(req: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions);

    // Authenticate the user
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse the request body
    const body = await req.json();

    // Validate the request body
    const parsedBody = reviewSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseId, userId, rating, comment } = parsedBody.data;

    // Check if the required fields are present, comment is optional
    if (!courseId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields courseId or rating.' },
        { status: 400 }
      );
    }

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Create a new review
    const review = new Review({ rating, comment, courseId, userId });
    await review.save();

    // Update the course's rating
    course.ratingCount = (course.ratingCount || 0) + 1;
    course.ratingSum = (course.ratingSum || 0) + rating;
    course.averageRating = course.ratingSum / course.ratingCount;
    await course.save();

    return NextResponse.json(
      { error: 'Review added successfully.', review },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Error adding review.', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Update a review
export async function PUT(req: NextRequest) {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse the request body
    const body = await req.json();
    const parsedBody = reviewSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseId, userId, rating, comment } = parsedBody.data;

    // Check if the required fields are present
    if (!courseId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields courseId, rating or comment.' },
        { status: 400 }
      );
    }

    // Ensure the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Find the existing review
    const review = await Review.findOne({ courseId, userId });
    if (!review) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }
    const oldRating = review.rating;

    // Update the review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update the course's rating
    course.ratingSum = (course.ratingSum || 0) + rating - oldRating;
    course.averageRating = course.ratingSum / course.ratingCount;
    await course.save();

    return NextResponse.json(
      { error: 'Review updated successfully.', review },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Error updating review.', message: (error as Error).message },
      { status: 500 }
    );
  }
}
