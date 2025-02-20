import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { Types } from 'mongoose';

export async function POST(req: Request) {
  try {
    await connectDB();
    const formData: FormData = await req.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priceString = formData.get('price') as string;
    const price = priceString ? Number(priceString) : 0;
    const thumbnail = formData.get('thumbnail');
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map((tag) => tag.trim()) : [];
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
      level: 'beginner',
      status,
      reviews: [],
      averageRating: 0,
      revenue: 0,
      tags
    };
    console.log("courseData", courseData);

    const newCourse = new Course(courseData);
    const savedCourse = await newCourse.save();
    return NextResponse.json({ savedCourse }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course', message: (error as Error).message }, { status: 500 });
  }
}