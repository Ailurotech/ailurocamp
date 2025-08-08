import { getServerSession } from 'next-auth';
import Course from '@/models/Course';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(
  req: any,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const { courseId } = params;
  let course;
  try {
    course = await Course.findOne({
      _id: new mongoose.Types.ObjectId(courseId),
      enrolledStudents: new mongoose.Types.ObjectId(session.user.id),
    });
  } catch (e) {
    return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
  }
  return NextResponse.json({ course });
}
