import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !(session.user as any).roles.includes('admin')
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
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { message: 'Error fetching users' },
      { status: 500 }
    );
  }
}
