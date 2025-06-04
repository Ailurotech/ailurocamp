import { NextRequest, NextResponse } from 'next/server';
import { Assignment } from '@/types/assignment';
import { randomUUID } from 'crypto';
import { assignments } from './assignmentsStore';

export async function GET() {
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    console.log('Received FormData:', Array.from(formData.entries())); // 调试日志

    const dataField = formData.get('data');
    if (!dataField) {
      throw new Error('Missing "data" field in FormData');
    }

    const body = JSON.parse(dataField as string);

    console.log('Request body:', req.body); // 打印请求体内容
    console.log('Assignments before push:', assignments); // 打印当前 assignments 状态

    const assignment: Assignment = {
      id: randomUUID(),
      title: body.title || '',
      description: body.description || '',
      dueDate: body.dueDate || '',
      timeLimit: body.timeLimit || 0,
      passingScore: body.passingScore || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: body.questions || [],
    };

    assignments.push(assignment);

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('❌ Failed to handle JSON POST:', error);
    return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const updatedAssignment: Assignment = await req.json();

  const index = assignments.findIndex((a) => a.id === id);
  if (index !== -1) {
    assignments[index] = updatedAssignment;
    return NextResponse.json(updatedAssignment, { status: 200 });
  } else {
    return new NextResponse('Assignment not found', { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const index = assignments.findIndex((a) => a.id === id);
  if (index !== -1) {
    assignments.splice(index, 1);
    return new Response(null, { status: 204 });
  } else {
    return new NextResponse('Assignment not found', { status: 404 });
  }
}
