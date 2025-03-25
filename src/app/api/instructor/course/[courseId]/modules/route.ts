import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import z from 'zod';
import type { IModuleApiReq } from '@/types/module';
import type { ICourse, IModule } from '@/models/Course';

// GET all modules for a course
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
): Promise<NextResponse> {
  try {
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.currentRole) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find course
    const { courseId } = await params;

    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { modules: course.modules.sort((a, b) => a.order - b.order) },
      { status: 200 }
    );
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
    // Authenticate the user
    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.currentRole) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { title, content, order, duration }: IModuleApiReq = await req.json();

    // Define a Zod schema for module input validation
    const moduleSchema = z.object({
      title: z.string().min(1, 'Module title is required'),
      content: z.string().min(1, 'Module content is required'),
      order: z.preprocess(
        (val) => parseInt(val as string),
        z.number().nonnegative('Order must be non-negative')
      ),
      duration: z.preprocess(
        (val) => parseFloat(val as string),
        z.number().nonnegative('Duration must be non-negative')
      ),
    });

    // Validate module data
    const result = moduleSchema.safeParse({
      title,
      content,
      order,
      duration,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors, errors: result.error.errors },
        { status: 400 }
      );
    }

    // Find course
    const { courseId } = await params;
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Push new module
    course.modules.push({ title, content, order: +order, duration: +duration });

    // Sort modules by order
    course.modules.sort((a, b) => a.order - b.order);

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
    // Authenticate the user (instructor only)
    const session: Session | null = await getServerSession(authOptions);
    if (session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get moduleId
    const { searchParams } = new URL(req.url);
    const id: string | null = searchParams.get('moduleId');

    const { title, content, order, duration }: IModuleApiReq = await req.json();

    // Find course
    const { courseId } = await params;
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Find the module in the course
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

      // Sort modules by order
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
    // Authenticate the user (instructor only)
    const session: Session | null = await getServerSession(authOptions);
    if (session?.user?.currentRole !== 'instructor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get moduleId
    const { searchParams } = new URL(req.url);
    const id: string | null = searchParams.get('moduleId');

    if (!id) {
      return NextResponse.json(
        { message: 'No moduleId provided' },
        { status: 400 }
      );
    }

    // Find Course
    const { courseId } = await params;
    const course: ICourse | null = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete the module
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
