import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Review from '@/models/Review';

// Get all reviews
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get the course ID from the query parameters
    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');

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

// Create or update a review
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Authenticate the user
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse the request body
    const { courseId, userId, rating, comment } = await req.json();

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

    // Add the review to the course
    // course.reviews.push({ rating, comment, user: session.user.id });
    // await course.save();
    // Check if the user has already reviewed the course
    let review = await Review.findOne({ courseId, userId });
    if (review) {
      // Update the existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      // Create a new review
      review = new Review({ rating, comment, courseId, userId });
      await review.save();

      // Add the review to the course
      course.reviews.push(review);
      await course.save();
    }

    // Recalculate the average rating for the course
    const reviews = await Review.find({ courseId: course._id });
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
