'use server';

import { revalidatePath } from 'next/cache';
import { EnrollmentWithDetails } from '@/types';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import CourseModel from '@/models/Course';

export async function fetchEnrollments(
  userId: string
): Promise<EnrollmentWithDetails[]> {
  await connectDB();
  const courses = await CourseModel.find({ instructor: userId }).select('_id');
  const courseIds = courses.map((course) => course._id);

  const enrollments = (await Enrollment.find({
    courseId: { $in: courseIds },
  })
    .populate('studentId', 'name email')
    .populate('courseId', 'title')
    .lean()) as unknown as EnrollmentWithDetails[];

  return enrollments.map((enroll: EnrollmentWithDetails) => ({
    _id: enroll._id.toString(),
    studentId: {
      _id: enroll.studentId._id.toString(),
      name: enroll.studentId.name,
      email: enroll.studentId.email,
    },
    courseId: {
      _id: enroll.courseId._id.toString(),
      title: enroll.courseId.title,
      maxEnrollments: enroll.courseId.maxEnrollments,
    },
    enrolledAt: enroll.enrolledAt,
    progress: enroll.progress,
  }));
}

export async function getEnrolledStudents(
  userId: string,
  courseId: string,
  page: number = 1,
  limit: number = 10
): Promise<EnrollmentWithDetails[]> {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const enrollments = (await Enrollment.find({ courseId })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .lean()) as unknown as EnrollmentWithDetails[];

    return enrollments.map((enroll: EnrollmentWithDetails) => ({
      _id: enroll._id.toString(),
      courseId: {
        _id: enroll.courseId._id.toString(),
        title: enroll.courseId.title,
        maxEnrollments: enroll.courseId.maxEnrollments,
      },
      studentId: {
        _id: enroll.studentId._id.toString(),
        name: enroll.studentId.name,
        email: enroll.studentId.email,
      },
      enrolledAt: new Date(enroll.enrolledAt).toISOString(),
      progress: enroll.progress,
    }));
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    throw new Error('Failed to fetch enrolled students');
  }
}

export async function removeStudent(
  userId: string,
  courseId: string,
  studentId: string
): Promise<void> {
  try {
    await connectDB();
    await Enrollment.findOneAndDelete({ courseId, studentId });
    revalidatePath('/instructor/students');
  } catch (error) {
    console.error('Error removing student:', error);
    throw new Error('Failed to remove student');
  }
}

export async function setEnrollmentLimit(courseId: string, limit: number) {
  try {
    const response = await fetch(`/api/instructor/courses/${courseId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ maxEnrollments: limit }),
    });

    if (!response.ok) {
      throw new Error('Failed to update course limit');
    }

    revalidatePath('/instructor/students');
  } catch (error) {
    console.error('Error updating course limit:', error);
    throw new Error('Failed to update course limit');
  }
}

export async function generateReport(userId: string): Promise<string> {
  await connectDB();
  const courses = await CourseModel.find({ instructor: userId }).select('_id');
  const courseIds = courses.map((course) => course._id);

  const enrollments = (await Enrollment.find({
    courseId: { $in: courseIds },
  })
    .populate('studentId', 'name email')
    .populate('courseId', 'title')
    .lean()) as unknown as EnrollmentWithDetails[];

  const csvContent = [
    'Student Name,Email,Course Title,Enrollment Date,Progress',
    ...enrollments.map(
      (enroll: EnrollmentWithDetails) =>
        `"${enroll.studentId.name}","${enroll.studentId.email}","${enroll.courseId.title}",${new Date(
          enroll.enrolledAt
        ).toISOString()},${enroll.progress}%`
    ),
  ].join('\n');

  return csvContent;
}
