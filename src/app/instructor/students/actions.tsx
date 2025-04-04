'use server';

import { revalidatePath } from 'next/cache';
import { EnrollmentWithDetails } from '@/types';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import CourseModel from '@/models/Course';

interface Course {
  id: string;
  title: string;
  maxEnrollments: number;
}

const convertMongooseData = (data: any): any => {
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (data?._id && typeof data._id === 'object') {
    data._id = data._id.toString();
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        convertMongooseData(value),
      ])
    );
  }
  return data;
};

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
    _id: enroll._id,
    studentId: enroll.studentId,
    courseId: enroll.courseId,
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

    const enrollments = await Enrollment.find({ courseId })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .lean()
      .exec();

    return enrollments.map((enroll: any) => ({
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
      enrolledAt: new Date(enroll.enrolledAt),
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

// export async function trackStudentProgress(userId: string, courseId: string, studentId: string): Promise<number> {
//   try {
//     await connectDB();
//     const enrollment: Enrollment | null = await EnrollmentModel.findOne({ courseId, studentId }).lean(); // Use Enrollment directly
//     if (!enrollment) {
//       throw new Error("Enrollment not found");
//     }
//     return enrollment.progress;
//   } catch (error) {
//     console.error("Error tracking student progress:", error);
//     throw new Error("Failed to track student progress");
//   }
// }

export async function setEnrollmentLimit(courseId: string, limit: number) {
  await connectDB();
  await CourseModel.findByIdAndUpdate(courseId, { maxEnrollments: limit });
  revalidatePath('/instructor/students');
}

export async function generateReport(userId: string): Promise<string> {
  await connectDB();
  const courses = await CourseModel.find({ instructor: userId }).select('_id');
  const courseIds = courses.map((course) => course._id);

  const enrollments = await Enrollment.find({
    courseId: { $in: courseIds },
  })
    .populate('studentId', 'name email')
    .populate('courseId', 'title')
    .lean();

  const csvContent = [
    'Student Name,Email,Course Title,Enrollment Date,Progress',
    ...enrollments.map(
      (enroll: any) =>
        `"${enroll.studentId?.name || ''}","${enroll.studentId?.email || ''}","${enroll.courseId?.title || ''}",${new Date(
          enroll.enrolledAt
        ).toISOString()},${enroll.progress}%`
    ),
  ].join('\n');

  return csvContent;
}
