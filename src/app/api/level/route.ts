// Fetch all levels
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseLevel from '@/models/CourseLevel';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


// Fetch all levels
export async function GET(): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const levels: { name: string }[] = await CourseLevel.find({});
    return NextResponse.json({ levels });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error fetching levels', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Create a new level
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Authenticate the user, only admin can create a level
    const session: Session | null = await getServerSession(authOptions);
    if (session?.user?.currentRole !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { level } = await req.json();
    await connectDB();
    const levelRes = await CourseLevel.create({ level });

    return NextResponse.json({ levelRes });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Error creating level', error: (error as Error).message },
      { status: 500 }
    );
  }
}