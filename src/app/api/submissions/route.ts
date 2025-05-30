import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File;
  const assignmentId = form.get('assignmentId');

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  console.log(`Received file: ${file.name} for assignment ${assignmentId}`);

  return NextResponse.json({ success: true });
}
