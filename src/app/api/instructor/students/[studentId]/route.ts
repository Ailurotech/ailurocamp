import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { removeStudent } from '@/app/instructor/students/actions';
import { Enrollment } from '@/models/Enrollment';

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, studentId } = params;

    const enrollment = await Enrollment.findOne({
      courseId,
      studentId,
    }).populate('courseId', 'instructor');

    if (enrollment?.courseId.instructor.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await removeStudent(userId, courseId, studentId);

    return NextResponse.json({
      message: 'Student removed successfully',
      removedStudentId: studentId,
    });
  } catch (error) {
    console.error('Student removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove student' },
      { status: 500 }
    );
  }
}
