import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { moduleSchema } from '@/lib/validation/moduleSchema';
import type { IModuleApiReq } from '@/types/module';
import type { ICourse, IModule } from '@/models/Course';

// GET all modules for a course
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
): Promise<NextResponse> {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.currentRole) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { courseId } = await params;
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ modules: course.modules }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Failed to fetch modules', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST create a new module
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.currentRole) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { title, content, order, duration }: IModuleApiReq = await req.json();
    const result = moduleSchema.safeParse({ title, content, order, duration });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors, errors: result.error.errors },
        { status: 400 }
      );
    }

    const { courseId } = await params;
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    course.modules.push({ title, content, order: +order, duration: +duration });
    await course.save();

    return NextResponse.json(
      { message: 'Module created successfully', modules: course.modules },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Failed to create module', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH update a module
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const id: string | null = searchParams.get('moduleId');

    if (!id) {
      return NextResponse.json(
        { message: 'No moduleId provided' },
        { status: 400 }
      );
    }

    const { title, content, order, duration }: IModuleApiReq = await req.json();
    const { courseId } = await params;
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    const moduleToEdit: IModule | null = course.modules.id(id);
    if (!moduleToEdit) {
      return NextResponse.json(
        { message: 'Module not found' },
        { status: 404 }
      );
    }

    if (title !== undefined) moduleToEdit.title = title;
    if (content !== undefined) moduleToEdit.content = content;
    if (order !== undefined) {
      moduleToEdit.order = +order;
      course.modules.sort((a, b) => a.order - b.order);
    }
    if (duration !== undefined) moduleToEdit.duration = +duration;

    await course.save();

    return NextResponse.json(
      { message: 'Module updated successfully', updatedModule: moduleToEdit },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Failed to update module', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE a module
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const id: string | null = searchParams.get('moduleId');

    if (!id) {
      return NextResponse.json(
        { message: 'No moduleId provided' },
        { status: 400 }
      );
    }

    const { courseId } = await params;
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    const moduleToDelete: IModule | null = course.modules.id(id);
    if (!moduleToDelete) {
      return NextResponse.json(
        { message: 'Module not found' },
        { status: 404 }
      );
    }

    await moduleToDelete.deleteOne();
    await course.save();

    return NextResponse.json(
      { message: 'Module deleted successfully', deletedModule: moduleToDelete },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: 'Failed to delete module', error: (error as Error).message },
      { status: 500 }
    );
  }
}
