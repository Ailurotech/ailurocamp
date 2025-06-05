import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
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

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const assignmentIndex = assignments.findIndex((a) => a.id === id);

  if (assignmentIndex === -1) {
    return new Response('Assignment not found', { status: 404 });
  }

  try {
    const formData = await req.formData();
    console.log('Received FormData:', Array.from(formData.entries())); // 调试日志

    const dataField = formData.get('data');
    console.log('Data field content:', dataField); // 调试日志

    const updatedAssignment = JSON.parse(dataField as string);

    const file = formData.get('file') as File | null;
    if (file) {
      console.log('Received file:', file.name);
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('Uploads directory ensured:', uploadsDir);

      let filePath = path.join(uploadsDir, file.name);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // 处理文件名冲突
      let counter = 1;
      const fileExt = path.extname(file.name);
      const fileNameWithoutExt = path.basename(file.name, fileExt);
      while (
        await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false)
      ) {
        filePath = path.join(
          uploadsDir,
          `${fileNameWithoutExt}(${counter})${fileExt}`
        );
        counter++;
      }

      await fs.writeFile(filePath, fileBuffer);
      console.log('File written to:', filePath);

      const fileUrl = `/uploads/${path.basename(filePath)}`;
      updatedAssignment.questions.forEach(
        (question: { testCases?: { output: string }[] }) => {
          if (question.testCases) {
            question.testCases.forEach((testCase) => {
              testCase.output = fileUrl;
            });
          }
        }
      );
    }

    assignments[assignmentIndex] = {
      ...assignments[assignmentIndex],
      ...updatedAssignment,
    };

    return new Response(JSON.stringify(assignments[assignmentIndex]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error handling PUT request:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Invalid request: ${errorMessage}`, { status: 400 });
  }
}
