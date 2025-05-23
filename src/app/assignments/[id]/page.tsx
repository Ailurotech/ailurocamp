import { notFound } from 'next/navigation';
import { Assignment } from '@/types/assignment';
import Link from 'next/link';
import DeleteButton from '@/components/assignment/DeleteButton'; // 👈 新增

async function getAssignment(id: string): Promise<Assignment> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/assignments/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch assignment');
  }
  return res.json();
}

type PageProps = {
  params: { id: string };
};

export default async function AssignmentDetailPage({ params }: PageProps) {
  const assignment = await getAssignment(params.id);
  if (!assignment) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen bg-gray-50">
      <Link
        href="/assignments"
        className="inline-block mb-6 text-blue-600 hover:underline"
      >
        ← Back to Assignments
      </Link>

      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-4">{assignment.title}</h1>
        <Link href={`/assignments/${assignment.id}/edit`}>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            ✏️ Edit
          </button>
        </Link>
        <DeleteButton id={assignment.id} />

        <p className="text-gray-700 mb-8">{assignment.description}</p>

        <h2 className="text-2xl font-semibold mb-4">Questions:</h2>

        {assignment.questions.length === 0 ? (
          <p className="text-gray-500">No questions added.</p>
        ) : (
          <ul className="space-y-6">
            {assignment.questions.map((question) => (
              <li
                key={question.id}
                className="border p-4 rounded-md bg-gray-50"
              >
                <div className="font-semibold">
                  {question.title} ({question.type})
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Points: {question.points}
                </div>

                {question.type === 'multiple-choice' && question.choices && (
                  <ul className="pl-5 list-disc text-gray-600">
                    {question.choices.map((choice, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{choice.label}</span>:{' '}
                        {choice.value}
                      </li>
                    ))}
                  </ul>
                )}

                {question.type === 'coding' && question.testCases && (
                  <div className="mt-2 space-y-2">
                    {question.testCases.map((testCase, idx) => (
                      <div key={idx} className="text-gray-600">
                        <div>
                          <span className="font-medium">Input:</span>{' '}
                          {testCase.input}
                        </div>
                        <div>
                          <span className="font-medium">Expected Output:</span>{' '}
                          {testCase.output}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
