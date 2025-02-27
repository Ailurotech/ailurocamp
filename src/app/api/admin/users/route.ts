import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

interface SessionUser {
  roles: string[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !(session.user as SessionUser).roles.includes('admin')
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const users = await User.find(
      {},
      {
        password: 0, // Exclude password field
      }
    );

    return NextResponse.json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
      })),
    });
  } catch (error: Error | unknown) {
    console.error('Fetch users error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { message: 'Error fetching users', error: errorMessage },
      { status: 500 }
    );
  }
}
