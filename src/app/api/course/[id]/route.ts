import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
// import { Types } from "mongoose";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await connectDB();
    const updatedContent = await req.json();
    console.log("updatedContent", updatedContent);
    
    const updatedResult = await Course.findByIdAndUpdate(id, updatedContent, { new: true });
    console.log("updatedResult", updatedResult);
    
    return NextResponse.json({ updatedResult });
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json({ error: 'Error updating course', message: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await connectDB();
    const deletedResult = await Course.findByIdAndDelete(id);
    return NextResponse.json({ deletedResult });
  } catch (error) {
    console.error('Delete course error:', error);    
    return NextResponse.json({ error: 'Error deleting course', message: (error as Error).message }, { status: 500 });
  }
}