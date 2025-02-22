import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { Types } from 'mongoose';

export async function POST(req: Request) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse the form data
    const formData: FormData = await req.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const level = formData.get('level') as string;
    const priceString = formData.get('price') as string;
    const price = priceString ? Number(priceString) : 0;
    const thumbnail = formData.get('thumbnail');
    const tagsString = formData.get('tags') as string;
    const tags = tagsString
      ? tagsString.split(',').map((tag) => tag.trim())
      : [];
    const status = formData.get('status') as string;
    const instructor = formData.get('instructor') as string;

    const courseData = {
      title,
      description,
      instructor: Types.ObjectId.createFromHexString(instructor),
      thumbnail: thumbnail instanceof File ? thumbnail.name : null,
      modules: [],
      enrolledStudents: [],
      price,
      category,
      level,
      status,
      averageRating: 0,
      revenue: 0,
      tags,
    };
    console.log('courseData', courseData);

    // Create a new course
    const newCourse = new Course(courseData);
    const savedCourse = await newCourse.save();
    return NextResponse.json({ savedCourse }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to create course', message: (error as Error).message },
      { status: 500 }
    );
  }
}
