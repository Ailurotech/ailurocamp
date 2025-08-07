import { getServerSession } from "next-auth";
import Course from "@/models/Course";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

export async function GET(req: any, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { courseId } = params;
  const course = await Course.findOne({
    _id: courseId,
    enrolledStudents: session.user.id
  });
  return NextResponse.json({ course });
} 