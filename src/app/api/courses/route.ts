import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

// Define types for query and sort objects
interface CourseQuery {
  status: string;
  category?: string;
  price?: {
    $gte?: number;
    $lte?: number;
  };
}

interface SortObject {
  [key: string]: 1 | -1;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const instructorName = searchParams.get('instructorName');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Build query for published courses only
    const query: CourseQuery = { status: 'published' };

    if (category && category !== 'all') {
      query.category = category;
    }

    // Add price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    // Build sort object based on sortBy parameter
    let sortObject: SortObject = {};
    switch (sortBy) {
      case 'newest':
        sortObject = { createdAt: -1 };
        break;
      case 'oldest':
        sortObject = { createdAt: 1 };
        break;
      case 'price-low':
        sortObject = { price: 1 };
        break;
      case 'price-high':
        sortObject = { price: -1 };
        break;
      case 'rating':
        sortObject = { averageRating: -1 };
        break;
      case 'title':
        sortObject = { title: 1 };
        break;
      default:
        sortObject = { createdAt: -1 };
    }

    // Get courses with instructor details
    const coursesQuery = Course.find(query)
      .populate('instructor', 'name email')
      .select(
        'title description thumbnail category level averageRating price modules createdAt'
      )
      .sort(sortObject);

    // If instructor name is provided, filter after population
    if (instructorName) {
      const allCourses = await coursesQuery.lean();
      const filteredCourses = allCourses.filter(
        (course) =>
          course.instructor &&
          course.instructor.name &&
          course.instructor.name
            .toLowerCase()
            .includes(instructorName.toLowerCase())
      );

      // Apply pagination to filtered results
      const paginatedCourses = filteredCourses.slice(skip, skip + limit);
      const totalCourses = filteredCourses.length;
      const totalPages = Math.ceil(totalCourses / limit);

      return NextResponse.json({
        courses: paginatedCourses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }

    // Normal flow without instructor filtering
    const courses = await coursesQuery.skip(skip).limit(limit).lean();

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query);
    const totalPages = Math.ceil(totalCourses / limit);

    return NextResponse.json({
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { message: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
