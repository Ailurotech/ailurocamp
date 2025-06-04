'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { Assignment } from '@/types/assignment';
import { useRouter } from 'next/navigation';
import MultipleChoiceFields from './MultipleChoiceFields';
import CodingTestCasesFields from './CodingTestCasesFields';
import QuillEditor from './QuillEditor';

type AssignmentFormProps = {
  defaultValues?: Assignment;
  onSubmit?: (data: Assignment) => void;
};

const AssignmentForm: React.FC<AssignmentFormProps> = ({ defaultValues }) => {
  const router = useRouter();

  const { control, handleSubmit, reset } = useForm<Assignment>({
    defaultValues: defaultValues ?? {
      title: '',
      description: '',
      questions: [],
      dueDate: '',
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
    const url = data.id ? `/api/assignments/${data.id}` : '/api/assignments';
    const method = data.id ? 'PUT' : 'POST';

    console.log('Submitting data:', data); 

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));

    data.questions.forEach((question) => {
      if (question.type === 'file-upload' && question.uploadedFile) {
        formData.append('file', question.uploadedFile);
      }
    });

    data.questions.forEach((question, questionIndex) => {
      if (question.type === 'coding' && question.testCases) {
        question.testCases.forEach((testCase, testCaseIndex) => {
          if (testCase.file) {
            const uniqueKey = `file_question${questionIndex}_testCase${testCaseIndex}`;
            formData.append(uniqueKey, testCase.file);
          }
        });
      }
    });

    console.log('Constructed FormData:', Array.from(formData.entries())); // 调试日志
    console.log('Data object:', data); // 打印 data 对象
    console.log('FormData entries:', Array.from(formData.entries())); // 打印 FormData 的内容

    data.questions.forEach((question, index) => {
      if (question.testCases) {
        question.testCases.forEach((testCase, testCaseIndex) => {
          console.log(`Question ${index} TestCase ${testCaseIndex}  Output:`, testCase.output ,'file:',testCase.file, 'input:', testCase.input);
        });
      }
    });

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      alert(`Upload failed: ${errorText}`); // 显示后端返回的错误信息
      return;
    }

    await res.json();
    router.push('/assignments');
  };

  return (
    <form onSubmit={handleSubmit(internalSubmit)}>
      <div className="mb-4">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              className="border p-2 w-full rounded"
              placeholder="Assignment Title"
            />
          )}
        />
      </div>

      <div className="mb-8">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <QuillEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">DueDate</h1>
      <div className="mb-4">
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="date"
              className="border p-2 w-full rounded"
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
