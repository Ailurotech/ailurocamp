'use client';

import React, { useState } from 'react';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';

export default function TestAssignmentCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const adapter = new AssignmentApiAdapter();
  const testCreateAssignment = async () => {
    setIsLoading(true);
    setResult('');

    try {
      const testData = {
        title: 'Test Assignment - Programming and File Upload Questions',
        description:
          'This is a test assignment containing programming and file upload questions',
        dueDate: '2024-12-31T23:59:59Z',
        points: 100,
        questions: [
          {
            question:
              'Please implement a function to calculate the sum of two numbers',
            type: 'coding' as const,
            points: 50,
            testCases: [
              {
                input: '1, 2',
                output: '3',
              },
              {
                input: '5, 7',
                output: '12',
              },
            ],
          },
          {
            question: 'Please upload your project code files',
            type: 'file-upload' as const,
            points: 30,
            fileType: '.zip,.rar,.tar.gz',
            maxFileSize: 10485760,
          },
          {
            question: 'Please explain your algorithm approach',
            type: 'essay' as const,
            points: 20,
          },
        ],
      };
      const result = await adapter.createAssignment(
        '6842ba9dfc2972e671d5a48c',
        testData
      );
      setResult(
        `Assignment created successfully: ${JSON.stringify(result, null, 2)}`
      );
    } catch (error) {
      console.error('Assignment creation failed:', error);
      setResult(
        `Creation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {' '}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">
          Test Assignment Creation Function
        </h1>

        <button
          onClick={testCreateAssignment}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Creating...' : 'Test Create Assignment'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded border">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
