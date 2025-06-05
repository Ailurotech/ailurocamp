import { Assignment } from '@/types/assignment';

export const assignments: Assignment[] = [
  {
    id: '1',
    title: 'Sample Assignment',
    description: 'This is a sample assignment for testing purposes.',
    questions: [
      {
        id: 'q1',
        type: 'coding',
        title: 'Write a function to add two numbers.',
        points: 10,
        testCases: [
          {
            input: '2, 3',
            output: '5',
          },
          {
            input: '10, 20',
            output: '/uploads/sample.jpg',
          },
        ],
      },
      {
        id: 'q2',
        type: 'file-upload',
        title: 'Upload a file containing your project.',
        points: 20,
        fileType: 'application/zip',
        placeholder: 'Upload your project as a .zip file.',
      },
    ],
    dueDate: '2023-12-31',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02',
  },
];
