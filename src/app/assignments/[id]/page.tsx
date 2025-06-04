'use client';

import React, { useEffect, useState } from 'react';
import { Assignment } from '@/types/assignment';
import Link from 'next/link';
import DeleteButton from '@/components/assignment/DeleteButton';
import { useParams } from 'next/navigation';

export default function AssignmentDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/assignments/${id}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setAssignment(data);
      }
      setLoading(false);
    };

    fetchAssignment();
  }, [id]);

  useEffect(() => {
    if (assignment && assignment.questions) {
      assignment.questions.forEach((question) => {
        if (question.type === 'coding' && question.testCases) {
          question.testCases.forEach((testCase) => {
            if (
              testCase.file &&
              typeof testCase.file === 'object' &&
              'name' in testCase.file &&
              'type' in testCase.file &&
              !(testCase.file instanceof File)
            ) {
              // Convert plain object to File instance if necessary
              const { name, type } = testCase.file as { name: string; type: string };
              testCase.file = new File([JSON.stringify(testCase.file)], name, { type });
            }
          });
        }
      });
    }
  }, [assignment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', id);

    const res = await fetch('/api/submissions', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Submitted!');
    } else {
      alert('Upload failed');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!assignment) return <p>Assignment not found.</p>;

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

        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Due Date:</span>{' '}
          {assignment.dueDate
            ? new Date(assignment.dueDate).toLocaleDateString()
            : 'N/A'}
        </p>

        <p className="text-gray-600 mb-6">
          <span className="font-semibold">Time Limit:</span>{' '}
          {assignment.timeLimit ? `${assignment.timeLimit} minutes` : 'N/A'}
        </p>

        <Link href={`/assignments/${assignment.id}/edit`}>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2">
            ✏️ Edit
          </button>
        </Link>
        <DeleteButton id={assignment.id} />

        <h2 className="text-2xl font-semibold mt-8 mb-4">Description:</h2>
        <div
          className="prose prose-sm text-gray-700 mb-8"
          dangerouslySetInnerHTML={{ __html: assignment.description }}
        />

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
                          <span className="font-medium">Input:</span> {typeof testCase.input === 'string' ? testCase.input : JSON.stringify(testCase.input)}
                        </div>
                        <div>
                          <span className="font-medium">Expected Output:</span>{' '}
                          {typeof testCase.output === 'string' && testCase.output.trim() !== '' && /\.(png|jpe?g|gif|svg|webp)$/.test(testCase.output) ? (
                            <img
                              src={testCase.output.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${testCase.output}` : testCase.output}
                              alt="Expected Output"
                              className="mt-2 max-w-full h-auto rounded-lg border border-gray-300"
                            />
                          ) : (
                            testCase.output
                          )}
                        </div>
                        {testCase.file && testCase.file instanceof File && (
                          <div className="mt-2">
                            {testCase.file.type.startsWith('image/') ? (
                              <div>
                                <span className="font-medium">Uploaded Image:</span>
                                {(() => {
                                  try {
                                    if (!(testCase.file instanceof File)) {
                                      console.warn('testCase.file is not a valid File object:', testCase.file);
                                      return <p className="text-red-500">Invalid file format.</p>;
                                    }

                                    const imageUrl = URL.createObjectURL(testCase.file);
                                    console.log('Generated image URL:', imageUrl);

                                    return (
                                      <img
                                        src={imageUrl}
                                        alt="Uploaded Preview"
                                        className="mt-2 max-w-full h-auto rounded-lg border border-gray-300"
                                        onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                                        onError={() => console.error('Failed to load image:', imageUrl)}
                                      />
                                    );
                                  } catch (error) {
                                    console.error('Error creating object URL for image:', error);
                                    return <p className="text-red-500">Failed to load image preview.</p>;
                                  }
                                })()}
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium">Uploaded File:</span>{' '}
                                <a
                                  href={(() => {
                                    try {
                                      return URL.createObjectURL(testCase.file);
                                    } catch (error) {
                                      console.error('Error creating object URL for file:', error);
                                      return '#';
                                    }
                                  })()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {testCase.file.name}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleSubmit} className="mt-8 border-t pt-4">
          <label className="block mb-2 font-medium">Submit your work:</label>
          <input
            type="file"
            accept=".pdf,.docx,.zip"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
