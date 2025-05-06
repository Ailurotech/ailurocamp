// src/app/api/assignments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Assignment } from '@/types/assignment';
import { randomUUID } from 'crypto';

let assignments: Assignment[] = [];

export async function GET() {
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newAssignment: Assignment = {
    ...body,
    id: randomUUID(),
  };
  assignments.push(newAssignment);
  return NextResponse.json(newAssignment, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const updatedAssignment: Assignment = await req.json();

  assignments = assignments.map((a) => (a.id === id ? updatedAssignment : a));
  return NextResponse.json(updatedAssignment, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  assignments = assignments.filter((a) => a.id !== id);
  return new Response(null, { status: 204 });
}
