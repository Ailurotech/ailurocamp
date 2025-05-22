import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import StudentProgress from '@/models/StudentProgress';

// Simple in-memory rate limiting store
const rateLimitStore: Record<string, { count: number, timestamp: number }> = {};

// Rate limit configuration
const RATE_LIMIT = 20; // Maximum requests
const RATE_LIMIT_WINDOW = 60 * 1000; // Time window in milliseconds (1 minute)

// Helper function to check rate limit
function checkRateLimit(ip: string): { limited: boolean, remaining: number } {
  const now = Date.now();
  
  // Initialize or reset expired entries
  if (!rateLimitStore[ip] || now - rateLimitStore[ip].timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore[ip] = { count: 0, timestamp: now };
  }
  
  // Increment request count
  rateLimitStore[ip].count++;
  
  // Check if rate limit is exceeded
  const isLimited = rateLimitStore[ip].count > RATE_LIMIT;
  const remaining = Math.max(0, RATE_LIMIT - rateLimitStore[ip].count);
  
  return { limited: isLimited, remaining };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string; studentId: string } }
) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    
    // If rate limit exceeded, return 429 Too Many Requests
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Math.ceil(Date.now() / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW).toString()
          }
        }
      );
    }
    
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !session.user.roles?.includes('instructor')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, studentId } = params;
    const { overallProgress } = await request.json();

    if (
      typeof overallProgress !== 'number' ||
      overallProgress < 0 ||
      overallProgress > 100
    ) {
      return NextResponse.json(
        { error: 'Invalid progress value' },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await StudentProgress.updateOne(
      {
        course: new ObjectId(courseId),
        student: new ObjectId(studentId),
      },
      {
        $set: {
          overallProgress: overallProgress,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Student progress record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Progress updated successfully' },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': (Math.ceil(Date.now() / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW).toString()
        }
      }
    );
  } catch (error) {
    console.error('Error updating student progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
