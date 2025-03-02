import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserRole } from '@/app/types/user';

interface SwitchRoleRequest {
  newRole: UserRole;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { newRole } = (await req.json()) as SwitchRoleRequest;

    // Validate role
    const validRoles: UserRole[] = ['admin', 'instructor', 'student'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user has the role they're trying to switch to
    if (!user.roles.includes(newRole)) {
      return NextResponse.json(
        { message: 'User does not have this role' },
        { status: 403 }
      );
    }

    // Update currentRole
    user.currentRole = newRole;
    await user.save();

    return NextResponse.json({
      message: 'Role switched successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
      },
    });
  } catch (error: Error | unknown) {
    console.error('Switch role error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { message: 'Error switching role', error: errorMessage },
      { status: 500 }
    );
  }
}
