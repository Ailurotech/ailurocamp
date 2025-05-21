import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { ICourse } from '@/models/Course';
import User, { IUser } from '@/models/User';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { courseSchema } from '@/lib/validation/courseSchema';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Readable } from 'stream';
import CourseCategory from '@/models/CourseCategory';
import CourseLevel from '@/models/CourseLevel';
import type { ICourseFormData } from '@/types/course';
import type { ICategory } from '@/models/CourseCategory';
import type { ILevel } from '@/models/CourseLevel';

// Promisify the pipeline function
const pipelineAsync: (
  readable: NodeJS.ReadableStream,
  writable: NodeJS.WritableStream
) => Promise<void> = promisify(pipeline);

// Get all courses by instructor ID
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user || session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the instructor ID from the search parameters
    const searchParams: URLSearchParams = req.nextUrl.searchParams;
    const instructorId: string | null = searchParams.get('instructorId');
    const page: number = parseInt(searchParams.get('page') || '1', 10);
    const limit: number = 10;
    const skip: number = (page - 1) * limit;

    // Fetch the courses by instructor ID
    await connectDB();
    const courses: ICourse[] = await Course.find({ instructor: instructorId })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    // Get the total count of courses for pagination controls
    const totalCourses: number = await Course.countDocuments({
      instructor: instructorId,
    });
    return NextResponse.json({ courses, totalCourses, page, limit });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Failed to fetch courses', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Create a new course
export async function POST(req: Request): Promise<Response> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Retrive valid categories and levels from the database
    // category
    const categoryDocs: ICategory[] = await CourseCategory.find({});
    const validCategories: string[] = categoryDocs[0].category;

    if (validCategories.length === 0) {
      return NextResponse.json(
        { message: 'No valid categories found' },
        { status: 500 }
      );
    }

    // level
    const levelDocs: ILevel[] = await CourseLevel.find({});
    const validLevels: string[] = levelDocs[0].level;

    if (validLevels.length === 0) {
      return NextResponse.json(
        { message: 'No valid levels found' },
        { status: 500 }
      );
    }

    // Extract the form data
    const formData: FormData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const level = formData.get('level') as string;
    const priceString = formData.get('price') as string;
    const thumbnail = formData.get('thumbnail') as File | null;
    const tagsString = formData.get('tags') as string;
    const status = formData.get('status') as string;
    const instructor = formData.get('instructor') as string;

    // Check the instructor ID
    const user: IUser | null = await User.findById(instructor);
    if (!user) {
      return NextResponse.json(
        { message: 'Instructor not found' },
        { status: 404 }
      );
    }

    // Define a schema for the incoming course data.
    const formSchema = courseSchema(validCategories, validLevels);

    // Validate the course data
    const parsedCourseData = formSchema.safeParse({
      title,
      description,
      category,
      level,
      price: priceString,
      thumbnail,
      tagsString,
      status,
    });

    if (!parsedCourseData.success) {
      return NextResponse.json(
        { error: parsedCourseData.error.errors },
        { status: 400 }
      );
    }

    // Prepare the course data
    // Don't store the thumbnail at first, store it later by using the saved course id
    const courseData: ICourseFormData = {
      title,
      description,
      instructor,
      thumbnail: null,
      modules: [],
      enrolledStudents: [],
      price: parsedCourseData.data.price,
      category,
      level,
      status: parsedCourseData.data.status,
      averageRating: 0,
      revenue: 0,
      tags: tagsString ? tagsString.split(',').map((tag) => tag.trim()) : [],
    };

    // Create a new course
    const newCourse: ICourse = new Course(courseData);
    const savedCourse: ICourse = await newCourse.save();

    // If a thumbnail is provided, store it in public/images with a name based on the courseId
    if (thumbnail && thumbnail.size > 0) {
      const extension: string | undefined = thumbnail.name.split('.').pop();
      const fileName: string = `${title}_${savedCourse._id}.${extension}`; // Use the course title and courseId for the file name

      // Ensure the directory exists
      const directory: string = path.join(process.cwd(), 'public', 'images');
      await fsPromises.mkdir(directory, { recursive: true });

      // Convert the thumbnail file to a buffer and create a readable stream
      const filePath: string = path.join(directory, fileName);
      const buffer: Buffer = Buffer.from(await thumbnail.arrayBuffer());
      const ReadableStream: NodeJS.ReadableStream = Readable.from(buffer);
      const writeStream: NodeJS.WritableStream = fs.createWriteStream(filePath);

      // Pipe the readable stream to the write stream
      await pipelineAsync(ReadableStream, writeStream);

      // Update the course with the thumbnail path
      savedCourse.thumbnail = `public/images/${fileName}`;
      await savedCourse.save();
    }

    return NextResponse.json(
      { message: 'Course created successfully', savedCourse },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Failed to create course', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Update a course by course ID
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user || session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams: URLSearchParams = req.nextUrl.searchParams;
    const courseId: string | null = searchParams.get('courseId');
    await connectDB();
    const updatedContent: ICourse = await req.json();

    // Check if the course exists
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if the course belongs to the instructor
    if (course.instructor.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'The course does not belong to you, you cannot update it.' },
        { status: 401 }
      );
    }

    const updatedResult: ICourse | null = await Course.findByIdAndUpdate(
      courseId,
      updatedContent,
      {
        new: true,
      }
    );
    return NextResponse.json({
      message: 'Course updated successfully',
      updatedResult,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error updating course', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Delete a course by course ID
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user || session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams: URLSearchParams = req.nextUrl.searchParams;
    const courseId: string | null = searchParams.get('courseId');
    await connectDB();

    // Check if the course belongs to the instructor
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }
    if (course.instructor.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'The course does not belong to you, you cannot delete it.' },
        { status: 401 }
      );
    }

    const deletedResult: ICourse | null =
      await Course.findByIdAndDelete(courseId);
    return NextResponse.json({
      message: 'Course deleted successfully',
      deletedResult,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error deleting course', error: (error as Error).message },
      { status: 500 }
    );
  }
}
