import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import type { ICourse } from '@/types/course';

// Update a course
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await connectDB();
    const updatedContent: ICourse = await req.json();

    const updatedResult: ICourse | null = await Course.findByIdAndUpdate(
      id,
      updatedContent,
      {
        new: true,
      }
    );
    return NextResponse.json({ updatedResult });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Error updating course', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Delete a course
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    await connectDB();
    const deletedResult: ICourse | null = await Course.findByIdAndDelete(id);
    return NextResponse.json({ deletedResult });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Error deleting course', message: (error as Error).message },
      { status: 500 }
    );
  }
}
