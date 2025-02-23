import { NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Readable } from 'stream';

// Promisify the pipeline function
const pipelineAsync = promisify(pipeline);

// Define a schema for the incoming course data.
const courseSchema = z.object({
  title: z.string().min(1, 'Course title is required'),
  description: z.string().min(1, 'Course description is required'),
  category: z.enum(['frontend', 'backend', 'fullstack', 'mobile', 'design'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Invalid level' }),
  }),
  price: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().nonnegative('Price must be non-negative')
  ),
  tags: z.string().optional(),
  status: z.enum(['published', 'unpublished'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
  instructor: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid instructor id'),
});

export async function POST(req: Request) {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Extract the form data
    const formData: FormData = await req.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const level = formData.get('level') as string;
    const priceString = formData.get('price') as string;
    // const price = priceString ? Number(priceString) : 0;
    const thumbnail = formData.get('thumbnail') as File | null;
    const tagsString = formData.get('tags') as string;
    // const tags: string[] = tagsString
    //   ? tagsString.split(',').map((tag) => tag.trim())
    //   : [];
    const status = formData.get('status') as string;
    const instructor = formData.get('instructor') as string;

    // Validate the course data
    const parsedCourseData = courseSchema.safeParse({
      title,
      description,
      category,
      level,
      price: priceString,
      tagsString,
      status,
      instructor,
    });

    if (!parsedCourseData.success) {
      // console.log(parsedCourseData.error.errors);
      return NextResponse.json(
        { error: parsedCourseData.error.errors },
        { status: 400 }
      );
    }
    // console.log('parsedCourseData', parsedCourseData);

    // Prepare the course data
    // Don't store the thumbnail at first, store it later by using the saved course id
    const courseData = {
      title,
      description,
      instructor,
      thumbnail: null,
      modules: [],
      enrolledStudents: [],
      price: parsedCourseData.data.price,
      category,
      level,
      status,
      averageRating: 0,
      revenue: 0,
      tags: tagsString ? tagsString.split(',').map((tag) => tag.trim()) : [],
    };

    // Create a new course
    const newCourse = new Course(courseData);
    const savedCourse = await newCourse.save();

    // If a thumbnail is provided, store it in public/images with a name based on the courseId
    if (thumbnail && thumbnail.size > 0) {
      const extension = thumbnail.name.split('.').pop();
      const fileName = `${title}_${savedCourse._id}.${extension}`; // Use the course title and courseId for the file name

      // Ensure the directory exists
      const directory = path.join(process.cwd(), 'public', 'images');
      await fsPromises.mkdir(directory, { recursive: true });

      // Convert the thumbnail file to a buffer and create a readable stream
      const filePath = path.join(directory, fileName);
      const buffer = Buffer.from(await thumbnail.arrayBuffer());
      const ReadableStream = Readable.from(buffer);
      const writeStream = fs.createWriteStream(filePath);

      // Pipe the readable stream to the write stream
      await pipelineAsync(ReadableStream, writeStream);

      // Update the course with the thumbnail path
      savedCourse.thumbnail = `public/images/${fileName}`;
      await savedCourse.save();
    }

    return NextResponse.json({ savedCourse }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to create course', message: (error as Error).message },
      { status: 500 }
    );
  }
}
