import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';

export async function GET() {
  try {
    await connectDB();

    const assignments = await Assessment.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error('Error fetching all assignments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assignments',
        assignments: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
