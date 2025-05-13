import { NextRequest } from 'next/server';
import { assignments } from '../assignmentsStore';

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  const assignment = assignments.find((a) => a.id === id);

  if (!assignment) {
    return new Response('Assignment not found', { status: 404 });
  }

  return Response.json(assignment);
}
