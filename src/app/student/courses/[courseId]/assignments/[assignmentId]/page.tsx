'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Assignment, Question } from '@/types/assignment';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';

export default function StudentAssignmentPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>;
}) {
  const { courseId, assignmentId } = React.use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const adapter = React.useMemo(() => new AssignmentApiAdapter(), []);

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.currentRole !== 'student') {
      router.push('/');
      return;
    }

    fetchAssignment();
  }, [session, sessionStatus, router, courseId, assignmentId]);

  const fetchAssignment = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await adapter.getAssignment(courseId, assignmentId);
      
      if ('assignment' in result) {
        const apiResponse = result.assignment as {
          id: string;
          title: string;
          description: string;
          dueDate: string;
          points: number;
          questions?: Array<{
            question: string;
            type: string;
            points: number;
            options?: string[];
            correctAnswer?: string | string[];
            testCases?: Array<{
              input: string;
              output: string;
              file?: string | { name: string; url: string; size: number; type: string };
            }>;
            fileType?: string;
            maxFileSize?: number;
          }>;
        };
        
        const converted: Assignment = {
          id: apiResponse.id,
          title: apiResponse.title,
          description: apiResponse.description,
          dueDate: apiResponse.dueDate,
          points: apiResponse.points,
          timeLimit: 0,
          passingScore: 0,
          courseId: courseId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          questions: apiResponse.questions ? apiResponse.questions.map((q, index) => ({
            id: `${Date.now()}-${index}`,
            title: q.question,
            type: q.type as 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload',
            points: q.points,
            options: q.options,
            correctAnswer: q.correctAnswer,
            testCases: q.testCases,
            fileType: q.fileType,
            maxFileSize: q.maxFileSize,
          })) : [],
        };
        setAssignment(converted);
        
        // 如果有时间限制，开始倒计时
        if (converted.timeLimit && converted.timeLimit > 0) {
          setTimeRemaining(converted.timeLimit * 60); // 转换为秒
        }
      }
    } catch (error) {
      console.error('Failed to fetch assignment:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, assignmentId, adapter]);

  // 倒计时效果
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // 时间到了，自动提交
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleFileUpload = (questionId: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [questionId]: file
    }));
    // 对于文件上传，我们将文件名存储在答案中
    setAnswers(prev => ({
      ...prev,
      [questionId]: file.name
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      // 转换答案格式，处理文件上传
      const submissionAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: answer || null
      }));
      
      // 调用API提交作业
      const result = await adapter.submitAssignment(
        courseId,
        assignmentId,
        submissionAnswers
      );
      
      console.log('Assignment submitted successfully:', result);
      alert('Assignment submitted successfully!');
      router.push(`/student/courses/${courseId}/assignments`);
      
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert(`Failed to submit assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: Question, index: number) => {
    const questionId = question.id;
    
    return (
      <div key={questionId} className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Question {index + 1}
          </h3>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {question.points} pts
          </span>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{question.title}</p>
        </div>

        {/* Multiple Choice */}
        {question.type === 'multiple-choice' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={questionId}
                  value={option}
                  checked={answers[questionId] === option}
                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* True/False */}
        {question.type === 'true-false' && (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={questionId}
                value="true"
                checked={answers[questionId] === 'true'}
                onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                A
              </span>
              <span className="text-gray-700">True</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={questionId}
                value="false"
                checked={answers[questionId] === 'false'}
                onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                B
              </span>
              <span className="text-gray-700">False</span>
            </label>
          </div>
        )}

        {/* Short Answer */}
        {question.type === 'short-answer' && (
          <div>
            <textarea
              value={answers[questionId] || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        )}

        {/* Essay */}
        {question.type === 'essay' && (
          <div>
            <textarea
              value={answers[questionId] || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              placeholder="Write your essay here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={8}
            />
          </div>
        )}

        {/* Coding */}
        {question.type === 'coding' && (
          <div>
            <textarea
              value={answers[questionId] || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              placeholder="Write your code here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              rows={10}
            />
            {question.testCases && question.testCases.length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">Test Cases:</h4>
                <div className="space-y-3">
                  {question.testCases.map((testCase, testIndex) => (
                    <div key={testIndex} className="bg-white p-3 rounded border">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        Test Case {testIndex + 1}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Input:</span>
                          <div className="bg-gray-100 p-2 rounded font-mono mt-1">
                            {testCase.input || 'No input'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Expected Output:</span>
                          <div className="bg-gray-100 p-2 rounded font-mono mt-1">
                            {testCase.output || 'No output'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Upload */}
        {question.type === 'file-upload' && (
          <div>
            <input
              type="file"
              accept={question.fileType || '*'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(questionId, file);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {question.fileType && (
              <p className="text-sm text-gray-500 mt-2">
                Allowed file types: {question.fileType}
              </p>
            )}
            {question.maxFileSize && (
              <p className="text-sm text-gray-500 mt-1">
                Maximum file size: {Math.round(question.maxFileSize / (1024 * 1024))} MB
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.currentRole !== 'student') {
    return null;
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Assignment Not Found</h2>
            <p className="text-red-600 mb-4">The assignment you&apos;re looking for could not be found.</p>
            <Link 
              href={`/student/courses/${courseId}/assignments`}
              className="text-blue-600 hover:underline"
            >
              ← Back to Assignments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/student/courses/${courseId}/assignments`}
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Assignments
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {assignment.title}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-500">Points</div>
                <div className="text-lg font-semibold">{assignment.points}</div>
              </div>
              {assignment.dueDate && (
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Due Date</div>
                  <div className="text-lg font-semibold">
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              {timeRemaining !== null && (
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="text-sm text-yellow-600">Time Remaining</div>
                  <div className="text-lg font-semibold text-yellow-800">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              )}
            </div>
            
            <div 
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: assignment.description }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="mb-8">
          {assignment.questions.map((question, index) => 
            renderQuestion(question, index)
          )}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Make sure to review all your answers before submitting.
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
