import React from 'react';
import { Assignment } from '@/types/assignment';

interface AssignmentQuestionRendererProps {
  question: NonNullable<Assignment['questions']>[number];
  index: number;
  currentAnswer: string | string[] | undefined;
  uploadedFiles: Record<string, File>;
  onAnswerChange: (questionId: string, answer: string | string[]) => void;
  onFileUpload: (questionId: string, file: File) => void;
}

export default function AssignmentQuestionRenderer({
  question,
  index,
  currentAnswer,
  uploadedFiles,
  onAnswerChange,
  onFileUpload,
}: AssignmentQuestionRendererProps) {
  const questionId = question.id || question.title || `question-${index}`;

  return (
    <div className="mb-8 p-6 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Question {index + 1}: {question.question || question.title}
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {question.points} points
        </span>
      </div>

      {/* Multiple Choice */}
      {question.type === 'multiple-choice' && (
        <div className="space-y-2">
          {question.options?.map((option, optIndex) => (
            <label key={optIndex} className="flex items-center space-x-3">
              <input
                type="radio"
                name={questionId}
                value={option}
                checked={currentAnswer === option}
                onChange={(e) => onAnswerChange(questionId, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {/* True/False */}
      {question.type === 'true-false' && (
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name={questionId}
              value="true"
              checked={currentAnswer === 'true'}
              onChange={(e) => onAnswerChange(questionId, e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-700">True</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name={questionId}
              value="false"
              checked={currentAnswer === 'false'}
              onChange={(e) => onAnswerChange(questionId, e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-700">False</span>
          </label>
        </div>
      )}

      {/* Short Answer / Essay */}
      {(question.type === 'short-answer' || question.type === 'essay') && (
        <textarea
          value={(currentAnswer as string) || ''}
          onChange={(e) => onAnswerChange(questionId, e.target.value)}
          placeholder="Enter your answer..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={question.type === 'essay' ? 8 : 3}
        />
      )}

      {/* Coding */}
      {question.type === 'coding' && (
        <div>
          <textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => onAnswerChange(questionId, e.target.value)}
            placeholder="Write your code here..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
            rows={10}
          />
          {question.testCases && question.testCases.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Test Cases:</h4>
              <div className="space-y-2">
                {question.testCases.map((testCase, tcIndex) => (
                  <div key={tcIndex} className="bg-gray-50 p-3 rounded text-sm">
                    <div>
                      <strong>Input:</strong> {testCase.input}
                    </div>
                    <div>
                      <strong>Expected Output:</strong> {testCase.output}
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
            accept={question.fileType || '*/*'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (question.maxFileSize && file.size > question.maxFileSize) {
                  alert(
                    `File size exceeds maximum allowed size of ${(
                      question.maxFileSize /
                      1024 /
                      1024
                    ).toFixed(1)}MB`
                  );
                  return;
                }
                onFileUpload(questionId, file);
              }
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {question.maxFileSize && (
            <p className="text-sm text-gray-500 mt-1">
              Maximum file size: {(question.maxFileSize / 1024 / 1024).toFixed(1)}MB
            </p>
          )}
          {uploadedFiles[questionId] && (
            <p className="text-sm text-green-600 mt-2">
              Uploaded: {uploadedFiles[questionId].name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
