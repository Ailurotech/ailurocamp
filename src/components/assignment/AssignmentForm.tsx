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
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('dueDate', data.dueDate);
    formData.append('timeLimit', data.timeLimit?.toString() || '');
    formData.append('passingScore', data.passingScore?.toString() || '');

    data.questions.forEach((q, i) => {
      formData.append(`questions[${i}][id]`, q.id);
      formData.append(`questions[${i}][type]`, q.type);
      formData.append(`questions[${i}][title]`, q.title);
      formData.append(`questions[${i}][points]`, q.points.toString());

      if (q.type === 'multiple-choice' && q.choices) {
        q.choices.forEach((choice, j) => {
          formData.append(`questions[${i}][choices][${j}][value]`, choice.value);
          formData.append(`questions[${i}][choices][${j}][label]`, choice.label);
        });
      }

      if (q.type === 'coding' && q.testCases) {
        q.testCases.forEach((tc, j) => {
          formData.append(`questions[${i}][testCases][${j}][input]`, tc.input);
          formData.append(`questions[${i}][testCases][${j}][output]`, tc.output);
        });
      }

      if (q.type === 'file-upload') {
        if (q.fileType) {
          formData.append(`questions[${i}][fileType]`, q.fileType);
        }
        if (q.uploadedFile instanceof File) {
          formData.append(`questions[${i}][file]`, q.uploadedFile);
        }
      }

      if (q.type === 'essay' && q.placeholder) {
        formData.append(`questions[${i}][placeholder]`, q.placeholder);
      }
    });

    const res = await fetch('/api/assignments', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.error('Failed to submit assignment');
      return;
    }

    await res.json(); // optional: could remove
    router.push('/assignments');
  };

  return (
    <form onSubmit={handleSubmit(internalSubmit)}>
      {/* Title */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Title</label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input {...field} className="border p-2 w-full rounded" placeholder="Assignment Title" />
          )}
        />
      </div>

      {/* Description (Rich Text) */}
      <div className="mb-8">
        <label className="block mb-1 font-medium">Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <QuillEditor value={field.value} onChange={field.onChange} />}
        />
      </div>

      {/* Due Date */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Due Date</label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => <input {...field} type="date" className="border p-2 w-full rounded" />}
        />
      </div>

      {/* Time Limit */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Time Limit (minutes)</label>
        <Controller
          name="timeLimit"
          control={control}
          render={({ field }) => (
            <input {...field} type="number" className="border p-2 w-full rounded" placeholder="Enter time limit in minutes" />
          )}
        />
      </div>

      {/* Questions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Questions</h2>
          <button
            type="button"
            onClick={() => append({ id: Date.now().toString(), title: '', type: 'multiple-choice', points: 0 })}
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
                  <input {...field} className="border p-2 w-full mb-2 rounded" placeholder="Question Title" />
                )}
              />

              <label className="block mb-1 font-medium">Points</label>
              <Controller
                name={`questions.${index}.points`}
                control={control}
                render={({ field }) => (
                  <input {...field} type="number" className="border p-2 w-full mb-2 rounded" placeholder="Points" />
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

              {watchedType === 'multiple-choice' && <MultipleChoiceFields nestIndex={index} control={control} />}
              {watchedType === 'coding' && <CodingTestCasesFields nestIndex={index} control={control} />}

              {watchedType === 'file-upload' && (
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <label className="block mb-1 font-medium">Allowed File Type</label>
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
                <button type="button" onClick={() => remove(index)} className="text-red-600 hover:underline mt-2">
                  ❌ Remove Question
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
        Submit
      </button>
    </form>
  );
};

export default AssignmentForm;
