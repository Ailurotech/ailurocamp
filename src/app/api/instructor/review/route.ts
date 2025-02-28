import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Review from '@/models/Review';

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
    const { courseId, userId, rating, comment } : { courseId: string, userId: string, rating: number, comment: string } = await req.json();

    // Check if the required fields are present
    if (!courseId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields courseId, rating or comment.' },
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

    // Recalculate the average rating for the course
    const reviews = await Review.find({ courseId });
    course.averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
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
    const { courseId, userId, rating, comment }: { courseId: string, userId: string, rating: number, comment: string } = await req.json();

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

    // Update the review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Recalculate the average rating for the course
    const reviews = await Review.find({ courseId: course._id });
    course.averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
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