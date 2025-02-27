import { NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Readable } from 'stream';
import CourseCategory from '@/models/CourseCategory';
import CourseLevel from '@/models/CourseLevel';
import type { ICategory, ILevel, ICourseFormData } from '@/types/course';

// Promisify the pipeline function
const pipelineAsync: (
  readable: NodeJS.ReadableStream,
  writable: NodeJS.WritableStream
) => Promise<void> = promisify(pipeline);

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

    // Define a schema for the incoming course data.
    const courseSchema = z.object({
      title: z.string().min(1, 'Course title is required'),
      description: z.string().min(1, 'Course description is required'),
      category: z
        .string()
        .refine((value) => validCategories.includes(value), {
          message: 'Invalid category',
        }),
      level: z
        .string()
        .refine((value) => validLevels.includes(value), {
          message: 'Invalid level',
        }),
      price: z.preprocess(
        (val) => parseFloat(val as string),
        z.number().nonnegative('Price must be non-negative')
      ),
      thumbnail: z.instanceof(File).refine(
        (file) => file.type.startsWith('image/'),
        { message: 'Only image files are allowed.' }
      ),
      tags: z.string().optional(),
      status: z.enum(['published', 'unpublished'], {
        errorMap: () => ({ message: 'Invalid status' }),
      }),
      instructor: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid instructor id'),
    });

    // Validate the course data
    const parsedCourseData = courseSchema.safeParse({
      title,
      description,
      category,
      level,
      price: priceString,
      thumbnail,
      tagsString,
      status,
      instructor,
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
    const newCourse = new Course(courseData);
    const savedCourse = await newCourse.save();

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

    return NextResponse.json({ savedCourse }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to create course', message: (error as Error).message },
      { status: 500 }
    );
  }
}
