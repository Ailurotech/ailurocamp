import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserRole, UpdateUserRolesRequest } from '@/app/types/user';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, roles } = await req.json() as UpdateUserRolesRequest;

    // Validate roles
    const validRoles: UserRole[] = ['admin', 'instructor', 'student'];
    const invalidRoles = roles.filter(
      (role: UserRole) => !validRoles.includes(role)
    );
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { message: `Invalid roles: ${invalidRoles.join(', ')}` },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update roles and ensure currentRole is still valid
    user.roles = roles;
    if (!roles.includes(user.currentRole)) {
      user.currentRole = roles[0];
    }

    await user.save();

    return NextResponse.json({
      message: 'User roles updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
      },
    });
  } catch (error: Error | unknown) {
    console.error('Update roles error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { message: 'Error updating user roles', error: errorMessage },
      { status: 500 }
    );
  }
}
