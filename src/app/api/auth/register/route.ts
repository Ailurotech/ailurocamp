import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UserRole } from '@/app/types/user';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  roles?: UserRole[];
}

export async function POST(req: Request) {
  try {
    const { name, email, password, roles: initialRoles } = await req.json() as RegisterRequest;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure roles is an array and contains at least 'student'
    const roles = !Array.isArray(initialRoles) || initialRoles.length === 0
      ? ['student' as UserRole]
      : initialRoles;

    // Validate roles
    const validRoles: UserRole[] = ['admin', 'instructor', 'student'];
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { message: `Invalid roles: ${invalidRoles.join(', ')}` },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      roles,
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
      },
      { status: 201 }
    );
  } catch (error: Error | unknown) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { message: 'Error registering user', error: errorMessage },
      { status: 500 }
    );
  }
}
