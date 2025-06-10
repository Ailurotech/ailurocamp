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
      try {
        setLoading(true);
        // 使用新的通用作业API
        const response = await fetch(`/api/assignments/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assignment: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success || !result.assignment) {
          throw new Error(result.error || 'Assignment not found');
        }

        // 转换为 Assignment 类型
        const assignment: Assignment = {
          id: result.assignment.id,
          title: result.assignment.title,
          description: result.assignment.description,
          dueDate: result.assignment.dueDate,
          points: result.assignment.totalPoints || 100,
          courseId: result.assignment.courseId,
          questions: [],
          timeLimit: 0,
          passingScore: 0,
          createdAt: result.assignment.createdAt || new Date().toISOString(),
          updatedAt: result.assignment.updatedAt || new Date().toISOString(),
        };
        
        setAssignment(assignment);
      } catch (error) {
        console.error('Failed to fetch assignment:', error);
        // 设置错误状态，不再提供误导性的备用数据
        setAssignment(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssignment();
    }
  }, [id]);

  useEffect(() => {
    if (assignment && assignment.questions) {
      assignment.questions.forEach((question) => {
        if (question.type === 'coding' && question.testCases) {
          question.testCases.forEach((testCase) => {
            if (testCase.file && typeof testCase.file !== 'string') {
              console.warn('Unexpected testCase.file type:', testCase.file);
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

  const renderUploadedFiles = () => {
    if (!assignment || !assignment.questions) return null;

    return assignment.questions.map((question, questionIndex) => (
      <div key={questionIndex} className="mb-4">
        <h3 className="text-lg font-semibold">{question.title}</h3>
        {question.testCases?.map((testCase, testCaseIndex) => (
          <div key={testCaseIndex} className="mt-2">
            {testCase.file && (
              <div className="mt-2">
                <span className="font-medium">Uploaded Test Case File:</span>{' '}
                <a
                  href={
                    testCase.file.startsWith('/')
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${testCase.file}`
                      : testCase.file
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {testCase.file.split('/').pop()}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    ));
  };

  if (loading) return <div className="max-w-4xl mx-auto p-8"><p>Loading...</p></div>;
  if (!assignment) return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen bg-gray-50">
      <Link
        href="/assignments"
        className="inline-block mb-6 text-blue-600 hover:underline"
      >
        ← Back to Assignments
      </Link>
      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">作业未找到</h1>
        <p className="text-gray-600 mb-4">
          抱歉，无法找到请求的作业。可能的原因：
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-6">
          <li>作业ID不存在</li>
          <li>作业已被删除</li>
          <li>您没有访问权限</li>
          <li>网络连接问题</li>
        </ul>
        <div className="flex gap-4">
          <Link
            href="/assignments"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            返回作业列表
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            重新加载
          </button>
        </div>
      </div>
    </div>
  );

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
                          <span className="font-medium">Input:</span>{' '}
                          {typeof testCase.input === 'string'
                            ? testCase.input
                            : JSON.stringify(testCase.input)}
                        </div>
                        <div>
                          <span className="font-medium">Output:</span>{' '}
                          {typeof testCase.output === 'string'
                            ? testCase.output
                            : JSON.stringify(testCase.output)}
                        </div>
                        {testCase.file && (
                          <div className="mt-2">
                            <h2 className="text-2xl font-semibold mt-8 mb-4">
                              Uploaded Files:
                            </h2>
                            {renderUploadedFiles()}
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
        </form>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
