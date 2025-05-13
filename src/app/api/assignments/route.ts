import { NextRequest, NextResponse } from 'next/server';
import { Assignment } from '@/types/assignment';
import { randomUUID } from 'crypto';
import { assignments } from './assignmentsStore';

export async function GET() {
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newAssignment: Assignment = {
    ...body,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  assignments.push(newAssignment);
  return NextResponse.json(newAssignment, { status: 201 });
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
