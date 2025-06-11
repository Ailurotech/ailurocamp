'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { Assignment } from '@/types/assignment';
import { AssignmentApiAdapter } from '@/lib/assignmentApiAdapter';
import MultipleChoiceFields from './MultipleChoiceFields';
import CodingTestCasesFields from './CodingTestCasesFields';
import RobustQuillEditor from './QuillEditor';

type AssignmentFormProps = {
  defaultValues?: Assignment;
  onSubmit?: (data: Assignment) => void | Promise<void>;
  courseId?: string; // 新增课程ID支持
};

const AssignmentForm: React.FC<AssignmentFormProps> = ({ defaultValues, courseId, onSubmit }) => {
  const adapter = new AssignmentApiAdapter();

  const { control, handleSubmit, reset } = useForm<Assignment>({
    defaultValues: defaultValues ?? {
      title: '',
      description: '',
      questions: [],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 默认7天后
      points: 100, // 默认分数
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

  const internalSubmit = async (data: Assignment) => {
    console.log('Form submission - original data:', data);
    console.log('Form field values:');
    console.log('  title:', data.title);
    console.log('  description:', data.description);
    console.log('  dueDate:', data.dueDate);
    console.log('  points:', data.points);

    try {
      // 清理 Quill 编辑器的空内容
      let cleanDescription = data.description || '';
      // 移除 Quill 默认的空内容标签
      cleanDescription = cleanDescription.replace(/<p><br><\/p>/g, '').trim();
      // 如果只剩下空的 HTML 标签，将其视为空字符串
      if (cleanDescription === '<p></p>' || cleanDescription === '') {
        cleanDescription = '';
      }

      // 转换 questions 数据结构
      console.log('Original questions data:', data.questions);
      const convertedQuestions = data.questions?.map(question => ({
        question: question.title, // 将 title 映射到 question
        type: question.type as 'multiple-choice' | 'true-false' | 'short-answer' | 'essay',
        options: question.choices?.map(choice => choice.label) || [], // 将 choices 映射到 options
        points: question.points || 0
      })) || [];
      console.log('Converted questions:', convertedQuestions);

      const assignmentRequest = {
        title: data.title,
        description: cleanDescription,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        points: data.points || 100,
        questions: convertedQuestions // 包含 questions 数据
      };

      console.log('Converted assignment request data:', assignmentRequest);
      console.log('Request validation:');
      console.log('  title valid:', !!assignmentRequest.title);
      console.log('  description valid:', !!assignmentRequest.description);
      console.log('  dueDate valid:', !!assignmentRequest.dueDate);
      console.log('  points valid:', assignmentRequest.points !== undefined);

      if (!courseId) {
        throw new Error('课程ID是必需的，无法创建或更新作业');
      }

      if (data.id && defaultValues) {
        // 更新现有作业
        const result = await adapter.updateAssignment(courseId, data.id, assignmentRequest);
        console.log('Assignment updated successfully:', result);
      } else {
        // 创建新作业
        const result = await adapter.createAssignment(courseId, assignmentRequest);
        console.log('Assignment created successfully:', result);
      }
      
      // 调用外部的 onSubmit 回调
      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert(`提交失败: ${error instanceof Error ? error.message : String(error)}`);
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
            console.log('Description field render:', field.value);
            return (
              <div>
                {/* 使用防止双重初始化的 Quill 编辑器 */}
                <RobustQuillEditor 
                  value={field.value || ''}
                  onChange={(value) => {
                    console.log('RobustQuill onChange called with:', value);
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
                    <option value="coding">Coding</option>
                    <option value="file-upload">File Upload</option>
                    <option value="essay">Essay</option>
                  </select>
                )}
              />

              {watchedType === 'multiple-choice' && (
                <MultipleChoiceFields nestIndex={index} control={control} />
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
