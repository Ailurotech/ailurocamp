import { getServerSession } from 'next-auth';
import Course from '@/models/Course';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const { courseId } = await context.params;
  const course = await Course.findOne({
    _id: courseId,
    enrolledStudents: session.user.id,
  });
  return NextResponse.json({ course });
}
