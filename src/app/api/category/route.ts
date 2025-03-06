import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseCategory from '@/models/CourseCategory';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { ICategory } from '@/types/course';

// Fetch all categories
export async function GET(): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const categories: ICategory[] = await CourseCategory.find({});
    return NextResponse.json({ categories });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error fetching categories', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Create a new category
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user, only admin can create a category
    const session: Session | null = await getServerSession(authOptions);
    if (session?.user?.currentRole !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { category }: { category: string[] } = await req.json();
    await connectDB();

    // Check if there is a category exists
    const existingCategory = await CourseCategory.findOne();
    let categoryRes: ICategory;
    if (existingCategory) {
      // Replace the existing category with the new one
      existingCategory.category = category;
      categoryRes = await existingCategory.save();
    } else {
      // Create a new category
      categoryRes = await CourseCategory.create({ category });
    }
    return NextResponse.json({ message:"Category created successfully", categoryRes });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error creating category', error: (error as Error).message },
      { status: 500 }
    );
  }
}
