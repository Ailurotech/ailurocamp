import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseCategory from '@/models/CourseCategory';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Fetch all categories
export async function GET(): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const categories: { category: string }[] = await CourseCategory.find({});
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

    const { category } = await req.json();
    console.log("category", category);
    
    await connectDB();
    
    const categoryRes = await CourseCategory.create({ category });

    return NextResponse.json({ categoryRes });
  } catch (error: unknown) {
    console.log("error", error);
    return NextResponse.json(
      { message: 'Error creating category', error: (error as Error).message },
      { status: 500 }
    );
  }
}