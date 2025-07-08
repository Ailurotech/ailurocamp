'use client';

import React, { useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { Assignment } from '@/types/assignment';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';
import MultipleChoiceFields from './MultipleChoiceFields';
import CodingTestCasesFields from './CodingTestCasesFields';
import TrueFalseFields from './TrueFalseFields';
import ShortAnswerFields from './ShortAnswerFields';
import RobustQuillEditor from './QuillEditor';

type AssignmentFormProps = {
  defaultValues?: Assignment;
  onSubmit?: (data: Assignment) => void | Promise<void>;
  courseId?: string;
};

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  defaultValues,
  courseId,
  onSubmit,
}) => {
  const adapter = new AssignmentApiAdapter();
  const previousTypesRef = useRef<string[]>([]);

  const { control, handleSubmit, reset, setValue } = useForm<Assignment>({
    defaultValues: defaultValues ?? {
      title: '',
      description: '',
      questions: [],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
      points: 100,
      timeLimit: 0,
      passingScore: 0,
      createdAt: '',
      updatedAt: '',
      id: '',
    },
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchedQuestions = useWatch({ control, name: 'questions' });

  useEffect(() => {
    if (watchedQuestions) {
      watchedQuestions.forEach((question, index) => {
        const currentType = question?.type;
        const previousType = previousTypesRef.current[index];

        if (currentType && previousType && currentType !== previousType) {
          setValue(`questions.${index}.choices`, undefined);
          setValue(`questions.${index}.testCases`, undefined);
          setValue(`questions.${index}.fileType`, undefined);
          setValue(`questions.${index}.maxFileSize`, undefined);
        }

        previousTypesRef.current[index] = currentType || '';
      });
    }
  }, [watchedQuestions, setValue]);

  const internalSubmit = async (data: Assignment) => {
    try {
      let cleanDescription = data.description || '';
      cleanDescription = cleanDescription.replace(/<p><br><\/p>/g, '').trim();
      if (cleanDescription === '<p></p>' || cleanDescription === '') {
        cleanDescription = '';
      }

      const convertedQuestions =
        data.questions?.map((question) => {
          const baseQuestion = {
            question: question.title,
            type: question.type as
              | 'multiple-choice'
              | 'true-false'
              | 'short-answer'
              | 'essay'
              | 'coding'
              | 'file-upload',
            points: question.points || 0,
          };

          switch (question.type) {
            case 'multiple-choice':
              return {
                ...baseQuestion,
                options: question.choices?.map((choice) => choice.label) || [],
              };
            case 'true-false':
              return {
                ...baseQuestion,
                options: ['True', 'False'],
                correctAnswer: question.correctAnswer,
              };
            case 'short-answer':
              return {
                ...baseQuestion,
                correctAnswer: question.correctAnswer,
              };
            case 'coding':
              return {
                ...baseQuestion,
                testCases:
                  question.testCases?.map((testCase) => {
                    const testCaseData: {
                      input: string;
                      output: string;
                      file?:
                        | string
                        | {
                            name: string;
                            url: string;
                            size: number;
                            type: string;
                          };
                    } = {
                      input: testCase.input || '',
                      output: testCase.output || '',
                    };
                    if (testCase.file) {
                      if (
                        typeof testCase.file === 'string' &&
                        testCase.file.trim()
                      ) {
                        testCaseData.file = testCase.file;
                      } else if (
                        typeof testCase.file === 'object' &&
                        'url' in testCase.file
                      ) {
                        testCaseData.file = {
                          name: testCase.file.name,
                          url: testCase.file.url,
                          size: testCase.file.size,
                          type: testCase.file.type,
                        };
                      }
                    }
                    return testCaseData;
                  }) || [],
              };
            case 'file-upload':
              return {
                ...baseQuestion,
                fileType: question.fileType,
                maxFileSize: question.maxFileSize,
              };
            default:
              return baseQuestion;
          }
        }) || [];

      const assignmentRequest = {
        title: data.title,
        description: cleanDescription,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        points: data.points || 100,
        questions: convertedQuestions,
      };

      if (!courseId) {
        throw new Error('Course ID is required');
      }

      if (data.id && defaultValues) {
        await adapter.updateAssignment(courseId, data.id, assignmentRequest);
      } else {
        await adapter.createAssignment(courseId, assignmentRequest);
      }

      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (error) {
      alert(
        `Submission failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(internalSubmit)}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignment Title
        </label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className="border p-2 w-full rounded"
              placeholder="Assignment Title"
              required
            />
          )}
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignment Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => {
            return (
              <div>
                <RobustQuillEditor
                  value={field.value || ''}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  placeholder="Enter assignment description..."
                />
              </div>
            );
          }}
        />
      </div>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">DueDate</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Due Date & Time
        </label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="datetime-local"
              className="border p-2 w-full rounded"
              placeholder="Select due date and time"
            />
          )}
        />
      </div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">timeLimit</h1>
      <div className="mb-4">
        <Controller
          name="timeLimit"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              className="border p-2 w-full rounded"
              placeholder="Enter time limit in minutes"
            />
          )}
        />
      </div>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">PassingScore</h1>
      <div className="mb-4">
        <Controller
          name="passingScore"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              className="border p-2 w-full rounded"
              placeholder="Enter passing score"
            />
          )}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Points
        </label>
        <Controller
          name="points"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              className="border p-2 w-full rounded"
              placeholder="Enter total points for this assignment"
              min="1"
              required
            />
          )}
        />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Questions</h2>
          <button
            type="button"
            onClick={() =>
              append({
                id: Date.now().toString(),
                title: '',
                type: 'multiple-choice',
                points: 0,
              })
            }
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ➕ Add Question
          </button>
        </div>

        {fields.map((field, index) => {
          const watchedType = watchedQuestions?.[index]?.type;

          return (
            <div key={field.id} className="border p-4 rounded mb-6">
              <label className="block mb-1 font-medium">Question Title</label>
              <Controller
                name={`questions.${index}.title`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    className="border p-2 w-full mb-2 rounded"
                    placeholder="Question Title"
                  />
                )}
              />

              <label className="block mb-1 font-medium">Points</label>
              <Controller
                name={`questions.${index}.points`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className="border p-2 w-full mb-2 rounded"
                    placeholder="Points"
                  />
                )}
              />

              <label className="block mb-1 font-medium">Type</label>
              <Controller
                name={`questions.${index}.type`}
                control={control}
                render={({ field }) => (
                  <select {...field} className="border p-2 w-full mb-4 rounded">
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="coding">Coding</option>
                    <option value="file-upload">File Upload</option>
                  </select>
                )}
              />

              {watchedType === 'multiple-choice' && (
                <MultipleChoiceFields nestIndex={index} control={control} />
              )}
              {watchedType === 'true-false' && (
                <TrueFalseFields nestIndex={index} control={control} />
              )}
              {watchedType === 'short-answer' && (
                <ShortAnswerFields nestIndex={index} control={control} />
              )}
              {watchedType === 'coding' && (
                <CodingTestCasesFields nestIndex={index} control={control} />
              )}

              {watchedType === 'file-upload' && (
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <label className="block mb-1 font-medium">
                    Allowed File Type
                  </label>
                  <Controller
                    name={`questions.${index}.fileType`}
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="border p-2 w-full rounded">
                        <option value="">Select file type</option>
                        <option value="pdf">PDF</option>
                        <option value="word">Word Document</option>
                        <option value="zip">ZIP Archive</option>
                      </select>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:underline mt-2"
                >
                  ❌ Remove Question
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  );
};

export default AssignmentForm;
