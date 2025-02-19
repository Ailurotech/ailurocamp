import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const user = await User.findById('6780adc69f9049da2db4b851');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update user document
    user.currentRole = 'admin';
    delete user.role;
    await user.save();

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
      },
    });
  } catch (error: any) {
    console.error('Fix user error:', error);
    return NextResponse.json(
      { message: 'Error fixing user', error: error.message },
      { status: 500 }
    );
  }
}
