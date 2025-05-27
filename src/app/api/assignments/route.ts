import { NextRequest, NextResponse } from 'next/server';
import { Assignment, QuestionType, Question } from '@/types/assignment';
import { randomUUID } from 'crypto';
import { assignments } from './assignmentsStore';

export async function GET() {
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const assignment: Assignment = {
      id: randomUUID(),
      title: (form.get('title') ?? '') as string,
      description: (form.get('description') ?? '') as string,
      dueDate: (form.get('dueDate') ?? '') as string,
      timeLimit: Number(form.get('timeLimit')) || 0,
      passingScore: Number(form.get('passingScore')) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [],
    };

    const questions: Question[] = [];

    let index = 0;
    while (form.has(`questions[${index}][id]`)) {
      const type = form.get(`questions[${index}][type]`) as QuestionType;

      const base = {
        id: (form.get(`questions[${index}][id]`) ?? '') as string,
        title: (form.get(`questions[${index}][title]`) ?? '') as string,
        type,
        points: Number(form.get(`questions[${index}][points]`)) || 0,
      };

      if (type === 'multiple-choice') {
        const choices: { value: string; label: string }[] = [];
        let c = 0;
        while (form.has(`questions[${index}][choices][${c}][label]`)) {
          choices.push({
            label: (form.get(`questions[${index}][choices][${c}][label]`) ?? '') as string,
            value: (form.get(`questions[${index}][choices][${c}][value]`) ?? '') as string,
          });
          c++;
        }
        questions.push({ ...base, choices });

      } else if (type === 'coding') {
        const testCases: { input: string; output: string }[] = [];
        let t = 0;
        while (form.has(`questions[${index}][testCases][${t}][input]`)) {
          testCases.push({
            input: (form.get(`questions[${index}][testCases][${t}][input]`) ?? '') as string,
            output: (form.get(`questions[${index}][testCases][${t}][output]`) ?? '') as string,
          });
          t++;
        }
        questions.push({ ...base, testCases });

      } else if (type === 'file-upload') {
        const fileType = (form.get(`questions[${index}][fileType]`) ?? '') as string;
        const file = form.get(`questions[${index}][file]`) as File;
        questions.push({ ...base, fileType, uploadedFile: file });

      } else if (type === 'essay') {
        const placeholder = (form.get(`questions[${index}][placeholder]`) ?? '') as string;
        questions.push({ ...base, placeholder });

      } else {
        questions.push(base); // fallback
      }

      index++;
    }

    assignment.questions = questions;
    assignments.push(assignment);

    return NextResponse.json(assignment, { status: 201 });

  } catch (error) {
    console.error('❌ Failed to handle form POST:', error);
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
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
