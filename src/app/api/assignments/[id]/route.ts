import { NextRequest } from 'next/server';
import { assignments } from '../assignmentsStore';

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params; // 确保 params 被正确解包
  const assignment = assignments.find((a) => a.id === id);

  if (!assignment) {
    return new Response('Assignment not found', { status: 404 });
  }

  return Response.json(assignment);
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params; // 确保 params 被正确解包
  const assignmentIndex = assignments.findIndex((a) => a.id === id);

  if (assignmentIndex === -1) {
    return new Response('Assignment not found', { status: 404 });
  }

  try {
    const updatedAssignment = await req.json();
    assignments[assignmentIndex] = { ...assignments[assignmentIndex], ...updatedAssignment };

    return new Response(JSON.stringify(assignments[assignmentIndex]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('Invalid JSON format', { status: 400 });
  }
}
