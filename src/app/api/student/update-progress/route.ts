import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import StudentProgress from '@/models/StudentProgress';

interface LessonProgress {
  moduleIndex: number;
  lessonIndex: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number;
  lastPosition?: number;
}

interface ModuleProgress {
  moduleIndex: number;
  completedAt: Date;
  timeSpent: number;
  lastPosition?: number;
}

interface CourseModule {
  title: string;
  lessons: any[];
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'You must be logged in.' },
      { status: 401 }
    );
  }

  await connectDB();

  const {
    courseId,
    moduleIndex,
    lessonIndex,
    completed,
    timeSpent,
    lastPosition,
  } = await request.json();

  if (!courseId || moduleIndex === undefined || lessonIndex === undefined) {
    return NextResponse.json(
      { error: 'Course ID, module index, and lesson index are required' },
      { status: 400 }
    );
  }

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (!course.enrolledStudents.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    let progress = await StudentProgress.findOne({
      course: courseId,
      student: session.user.id,
    });

    if (!progress) {
      progress = new StudentProgress({
        course: courseId,
        student: session.user.id,
        completedModules: [],
        completedLessons: [],
        overallProgress: 0,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      });
    }

    progress.lastAccessedAt = new Date();

    const lessonProgressIndex = progress.completedLessons.findIndex(
      (lp: LessonProgress) =>
        lp.moduleIndex === moduleIndex && lp.lessonIndex === lessonIndex
    );

    if (lessonProgressIndex === -1) {
      progress.completedLessons.push({
        moduleIndex,
        lessonIndex,
        completed: completed || false,
        startedAt: new Date(),
        completedAt: completed ? new Date() : undefined,
        timeSpent: timeSpent || 0,
        lastPosition: lastPosition || 0,
      });
    } else {
      const lessonProgress = progress.completedLessons[lessonProgressIndex];

      if (!lessonProgress.completed && completed) {
        lessonProgress.completedAt = new Date();
      }

      lessonProgress.completed = completed || lessonProgress.completed;
      lessonProgress.timeSpent =
        (lessonProgress.timeSpent || 0) + (timeSpent || 0);

      if (lastPosition !== undefined) {
        lessonProgress.lastPosition = lastPosition;
      }

      progress.completedLessons[lessonProgressIndex] = lessonProgress;
    }

    const moduleCompletedLessons = progress.completedLessons.filter(
      (lp: LessonProgress) => lp.moduleIndex === moduleIndex && lp.completed
    );

    const totalModuleLessons =
      course.modules[moduleIndex]?.lessons?.length || 0;

    if (
      totalModuleLessons > 0 &&
      moduleCompletedLessons.length === totalModuleLessons
    ) {
      const moduleProgressIndex = progress.completedModules.findIndex(
        (mp: ModuleProgress) => mp.moduleIndex === moduleIndex
      );

      if (moduleProgressIndex === -1) {
        progress.completedModules.push({
          moduleIndex,
          completedAt: new Date(),
          timeSpent: moduleCompletedLessons.reduce(
            (total: number, lesson: LessonProgress) => total + lesson.timeSpent,
            0
          ),
        });
      } else {
        progress.completedModules[moduleProgressIndex].completedAt = new Date();
        progress.completedModules[moduleProgressIndex].timeSpent =
          moduleCompletedLessons.reduce(
            (total: number, lesson: LessonProgress) => total + lesson.timeSpent,
            0
          );
      }
    }

    const totalLessons = course.modules.reduce(
      (count: number, module: CourseModule) =>
        count + (module.lessons?.length || 0),
      0
    );

    const completedLessonsCount = progress.completedLessons.filter(
      (lp: LessonProgress) => lp.completed
    ).length;

    progress.overallProgress =
      totalLessons > 0
        ? Math.round((completedLessonsCount / totalLessons) * 100)
        : 0;

    await progress.save();

    return NextResponse.json({
      success: true,
      progress: {
        overallProgress: progress.overallProgress,
        completedLessons: progress.completedLessons.length,
        totalLessons,
      },
    });
  } catch (error) {
    console.error('Error updating student progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
