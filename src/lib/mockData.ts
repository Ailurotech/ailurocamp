// 测试数据文件 - 包含课程和作业的模拟数据
// 这个文件可以用于开发和测试环境

import { ICourse } from '@/types/course';
import { Assignment } from '@/types/assignment';

// 测试课程数据
export const mockCourses: ICourse[] = [
  {
    _id: '507f1f77bcf86cd799439011', // 有效的MongoDB ObjectId
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of modern web development including HTML, CSS, JavaScript, and React. This comprehensive course covers everything from basic syntax to building interactive web applications.',
    instructor: 'Dr. Sarah Johnson',
    thumbnail: '/images/courses/web-dev.jpg',
    modules: ['module-html', 'module-css', 'module-js', 'module-react'],
    enrolledStudents: ['student-1', 'student-2', 'student-3'],
    price: 299,
    category: 'Programming',
    level: 'Beginner',
    status: 'published',
    averageRating: 4.5,
    revenue: 2990,
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Frontend'],
    ratingCount: 10,
    ratingSum: 45,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-20'),
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Database Systems and SQL',
    description: 'Master database design, SQL queries, and database management systems. Learn to design efficient databases, write complex queries, and optimize database performance.',
    instructor: 'Prof. Michael Chen',
    thumbnail: '/images/courses/database.jpg',
    modules: ['module-db-design', 'module-sql', 'module-optimization'],
    enrolledStudents: ['student-1', 'student-4'],
    price: 399,
    category: 'Database',
    level: 'Intermediate',
    status: 'published',
    averageRating: 4.8,
    revenue: 1596,
    tags: ['SQL', 'Database Design', 'MySQL', 'PostgreSQL'],
    ratingCount: 4,
    ratingSum: 19,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-07-10'),
  },
  {
    _id: '507f1f77bcf86cd799439013',
    title: 'Data Structures and Algorithms',
    description: 'Deep dive into fundamental data structures and algorithms. Essential for technical interviews and building efficient software solutions.',
    instructor: 'Dr. Alex Rodriguez',
    thumbnail: '/images/courses/algorithms.jpg',
    modules: ['module-arrays', 'module-trees', 'module-graphs', 'module-sorting'],
    enrolledStudents: ['student-2', 'student-3', 'student-5'],
    price: 449,
    category: 'Computer Science',
    level: 'Advanced',
    status: 'published',
    averageRating: 4.7,
    revenue: 2245,
    tags: ['Algorithms', 'Data Structures', 'Problem Solving', 'Python'],
    ratingCount: 5,
    ratingSum: 23,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-07-15'),
  },
  {
    _id: '507f1f77bcf86cd799439014',
    title: 'UI/UX Design Principles',
    description: 'Learn user interface and user experience design principles. Create beautiful, functional, and user-friendly digital products.',
    instructor: 'Emily Thompson',
    thumbnail: '/images/courses/ui-ux.jpg',
    modules: ['module-design-thinking', 'module-prototyping', 'module-user-research'],
    enrolledStudents: ['student-1', 'student-3', 'student-6'],
    price: 349,
    category: 'Design',
    level: 'Beginner',
    status: 'published',
    averageRating: 4.6,
    revenue: 1745,
    tags: ['UI Design', 'UX Design', 'Figma', 'Prototyping'],
    ratingCount: 5,
    ratingSum: 23,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-07-12'),
  },
  {
    _id: '507f1f77bcf86cd799439015',
    title: 'Introduction to Machine Learning',
    description: 'Get started with machine learning concepts, algorithms, and practical implementations using Python and popular ML libraries.',
    instructor: 'Dr. Lisa Wang',
    thumbnail: '/images/courses/ml.jpg',
    modules: ['module-ml-basics', 'module-supervised', 'module-unsupervised'],
    enrolledStudents: ['student-4', 'student-5'],
    price: 599,
    category: 'AI/ML',
    level: 'Intermediate',
    status: 'published',
    averageRating: 4.9,
    revenue: 1198,
    tags: ['Machine Learning', 'Python', 'TensorFlow', 'Data Science'],
    ratingCount: 2,
    ratingSum: 10,
    createdAt: new Date('2024-05-20'),
    updatedAt: new Date('2024-07-16'),
  }
];

// 测试作业数据
export const mockAssignments: Assignment[] = [
  // Web Development Fundamentals 课程的作业
  {
    id: 'assignment-react-intro',
    title: 'Introduction to React Components',
    description: `
      <h3>Assignment Overview</h3>
      <p>Create a simple React application that demonstrates your understanding of React components, props, and state management.</p>
      
      <h4>Requirements:</h4>
      <ul>
        <li>Create at least 3 functional components</li>
        <li>Use props to pass data between components</li>
        <li>Implement useState hook for state management</li>
        <li>Add basic styling with CSS</li>
      </ul>
      
      <h4>Deliverables:</h4>
      <p>Submit your React project as a zip file containing all source code.</p>
    `,
    dueDate: '2025-07-25T23:59:59Z',
    points: 100,
    timeLimit: 120, // 2 hours
    passingScore: 70,
    courseId: '507f1f77bcf86cd799439011', // Web Development Fundamentals
    createdAt: '2024-07-10T10:00:00Z',
    updatedAt: '2024-07-10T10:00:00Z',
    questions: [
      {
        id: 'q1-react-components',
        title: 'What are the main differences between functional and class components in React?',
        type: 'essay',
        points: 25,
      },
      {
        id: 'q2-props-vs-state',
        title: 'Explain the difference between props and state in React',
        type: 'short-answer',
        points: 25,
      },
      {
        id: 'q3-react-project',
        title: 'Upload your React project files',
        type: 'file-upload',
        points: 50,
        fileType: '.zip,.tar.gz',
        maxFileSize: 10485760, // 10MB
      }
    ],
  },
  {
    id: 'assignment-css-layout',
    title: 'CSS Flexbox and Grid Layout',
    description: `
      <h3>Assignment Overview</h3>
      <p>Demonstrate your mastery of modern CSS layout techniques including Flexbox and CSS Grid.</p>
      
      <h4>Tasks:</h4>
      <ol>
        <li>Create a responsive navigation bar using Flexbox</li>
        <li>Build a card-based layout using CSS Grid</li>
        <li>Ensure the design is mobile-responsive</li>
      </ol>
    `,
    dueDate: '2025-07-22T23:59:59Z',
    points: 80,
    timeLimit: 90,
    passingScore: 60,
    courseId: '507f1f77bcf86cd799439011', // Web Development Fundamentals
    createdAt: '2024-07-05T09:00:00Z',
    updatedAt: '2024-07-05T09:00:00Z',
    questions: [
      {
        id: 'q1-flexbox-knowledge',
        title: 'Which CSS property is used to define the main axis in Flexbox?',
        type: 'multiple-choice',
        points: 20,
        options: ['flex-direction', 'justify-content', 'align-items', 'flex-wrap'],
        correctAnswer: 'flex-direction',
      },
      {
        id: 'q2-grid-vs-flexbox',
        title: 'When would you choose CSS Grid over Flexbox?',
        type: 'short-answer',
        points: 30,
      },
      {
        id: 'q3-layout-project',
        title: 'Upload your HTML and CSS files',
        type: 'file-upload',
        points: 30,
        fileType: '.html,.css,.zip',
        maxFileSize: 5242880, // 5MB
      }
    ],
  },

  // Database Systems 课程的作业
  {
    id: 'assignment-database-design',
    title: 'E-commerce Database Design Project',
    description: `
      <h3>Project Description</h3>
      <p>Design a complete database schema for an e-commerce platform including customers, products, orders, and inventory management.</p>
      
      <h4>Requirements:</h4>
      <ul>
        <li>Create an Entity-Relationship Diagram (ERD)</li>
        <li>Implement the database schema with proper constraints</li>
        <li>Write sample queries demonstrating CRUD operations</li>
        <li>Include at least 5 tables with appropriate relationships</li>
      </ul>
    `,
    dueDate: '2025-07-20T23:59:59Z',
    points: 150,
    timeLimit: 180, // 3 hours
    passingScore: 105,
    courseId: '507f1f77bcf86cd799439012', // Database Systems
    createdAt: '2024-07-08T11:00:00Z',
    updatedAt: '2024-07-08T11:00:00Z',
    questions: [
      {
        id: 'q1-normalization',
        title: 'What is the purpose of database normalization?',
        type: 'multiple-choice',
        points: 30,
        options: [
          'To reduce data redundancy and improve data integrity',
          'To make queries faster',
          'To reduce storage space only',
          'To make the database more complex'
        ],
        correctAnswer: 'To reduce data redundancy and improve data integrity',
      },
      {
        id: 'q2-foreign-keys',
        title: 'Explain the role of foreign keys in maintaining referential integrity',
        type: 'essay',
        points: 40,
      },
      {
        id: 'q3-sql-queries',
        title: 'Write SQL queries for the given scenarios',
        type: 'coding',
        points: 50,
        testCases: [
          {
            input: 'SELECT * FROM customers WHERE city = "New York"',
            output: 'Query should return all customers from New York'
          }
        ],
      },
      {
        id: 'q4-erd-diagram',
        title: 'Upload your ERD diagram and SQL schema',
        type: 'file-upload',
        points: 30,
        fileType: '.pdf,.png,.jpg,.sql',
        maxFileSize: 15728640, // 15MB
      }
    ],
  },

  // Data Structures and Algorithms 课程的作业
  {
    id: 'assignment-sorting-algorithms',
    title: 'Sorting Algorithms Implementation and Analysis',
    description: `
      <h3>Assignment Overview</h3>
      <p>Implement various sorting algorithms and analyze their time and space complexity.</p>
      
      <h4>Algorithms to Implement:</h4>
      <ul>
        <li>Bubble Sort</li>
        <li>Quick Sort</li>
        <li>Merge Sort</li>
        <li>Heap Sort</li>
      </ul>
      
      <h4>Analysis Required:</h4>
      <p>For each algorithm, provide time complexity analysis for best, average, and worst cases.</p>
    `,
    dueDate: '2025-07-18T23:59:59Z',
    points: 120,
    timeLimit: 150,
    passingScore: 84,
    courseId: '507f1f77bcf86cd799439013', // Data Structures and Algorithms
    createdAt: '2024-07-12T14:00:00Z',
    updatedAt: '2024-07-12T14:00:00Z',
    questions: [
      {
        id: 'q1-bubble-sort',
        title: 'Implement Bubble Sort in Python',
        type: 'coding',
        points: 30,
        testCases: [
          {
            input: '[64, 34, 25, 12, 22, 11, 90]',
            output: '[11, 12, 22, 25, 34, 64, 90]'
          },
          {
            input: '[5, 2, 8, 1, 9]',
            output: '[1, 2, 5, 8, 9]'
          }
        ],
      },
      {
        id: 'q2-quick-sort',
        title: 'Implement Quick Sort with proper pivot selection',
        type: 'coding',
        points: 40,
        testCases: [
          {
            input: '[10, 7, 8, 9, 1, 5]',
            output: '[1, 5, 7, 8, 9, 10]'
          }
        ],
      },
      {
        id: 'q3-complexity-analysis',
        title: 'Compare the time complexity of all implemented sorting algorithms',
        type: 'essay',
        points: 30,
      },
      {
        id: 'q4-code-submission',
        title: 'Upload your complete source code',
        type: 'file-upload',
        points: 20,
        fileType: '.py,.java,.cpp,.zip',
        maxFileSize: 2097152, // 2MB
      }
    ],
  },

  // UI/UX Design 课程的作业
  {
    id: 'assignment-ui-prototyping',
    title: 'Mobile App UI Prototyping',
    description: `
      <h3>Design Challenge</h3>
      <p>Create a complete UI prototype for a mobile application of your choice.</p>
      
      <h4>Requirements:</h4>
      <ul>
        <li>User research and persona development</li>
        <li>Wireframes for at least 5 screens</li>
        <li>High-fidelity mockups with consistent design system</li>
        <li>Interactive prototype demonstrating user flow</li>
      </ul>
      
      <h4>Tools:</h4>
      <p>Use Figma, Sketch, or Adobe XD for your designs.</p>
    `,
    dueDate: '2025-07-30T23:59:59Z',
    points: 140,
    timeLimit: 240, // 4 hours
    passingScore: 98,
    courseId: '507f1f77bcf86cd799439014', // UI/UX Design
    createdAt: '2024-07-14T13:00:00Z',
    updatedAt: '2024-07-14T13:00:00Z',
    questions: [
      {
        id: 'q1-design-principles',
        title: 'Which principle emphasizes the importance of visual hierarchy in UI design?',
        type: 'multiple-choice',
        points: 25,
        options: [
          'Contrast and emphasis',
          'Color theory',
          'Typography',
          'Animation principles'
        ],
        correctAnswer: 'Contrast and emphasis',
      },
      {
        id: 'q2-user-persona',
        title: 'Describe your target user persona and their needs',
        type: 'essay',
        points: 35,
      },
      {
        id: 'q3-accessibility',
        title: 'True or False: Color should be the only way to convey important information in UI design',
        type: 'true-false',
        points: 20,
        correctAnswer: 'false',
      },
      {
        id: 'q4-prototype-files',
        title: 'Upload your design files and prototype links',
        type: 'file-upload',
        points: 60,
        fileType: '.fig,.sketch,.xd,.pdf,.zip',
        maxFileSize: 52428800, // 50MB
      }
    ],
  },

  // Machine Learning 课程的作业
  {
    id: 'assignment-ml-classification',
    title: 'Binary Classification with Scikit-learn',
    description: `
      <h3>Machine Learning Project</h3>
      <p>Build a binary classification model to predict customer churn using the provided dataset.</p>
      
      <h4>Tasks:</h4>
      <ol>
        <li>Exploratory Data Analysis (EDA)</li>
        <li>Data preprocessing and feature engineering</li>
        <li>Model selection and training</li>
        <li>Model evaluation and interpretation</li>
      </ol>
      
      <h4>Models to Compare:</h4>
      <ul>
        <li>Logistic Regression</li>
        <li>Random Forest</li>
        <li>Support Vector Machine</li>
      </ul>
    `,
    dueDate: '2025-08-05T23:59:59Z',
    points: 200,
    timeLimit: 300, // 5 hours
    passingScore: 140,
    courseId: '507f1f77bcf86cd799439015', // Machine Learning
    createdAt: '2024-07-16T15:00:00Z',
    updatedAt: '2024-07-16T15:00:00Z',
    questions: [
      {
        id: 'q1-supervised-learning',
        title: 'What is the main difference between supervised and unsupervised learning?',
        type: 'short-answer',
        points: 30,
      },
      {
        id: 'q2-feature-scaling',
        title: 'Why is feature scaling important for some machine learning algorithms?',
        type: 'essay',
        points: 40,
      },
      {
        id: 'q3-model-evaluation',
        title: 'Which metric is most appropriate for evaluating a binary classification model with imbalanced classes?',
        type: 'multiple-choice',
        points: 30,
        options: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
        correctAnswer: 'F1-Score',
      },
      {
        id: 'q4-python-implementation',
        title: 'Implement a logistic regression model for the given dataset',
        type: 'coding',
        points: 60,
        testCases: [
          {
            input: 'model.fit(X_train, y_train)',
            output: 'Model should be trained successfully'
          }
        ],
      },
      {
        id: 'q5-project-notebook',
        title: 'Upload your Jupyter notebook with complete analysis',
        type: 'file-upload',
        points: 40,
        fileType: '.ipynb,.py,.zip',
        maxFileSize: 20971520, // 20MB
      }
    ],
  }
];

// 辅助函数：根据课程ID获取作业
export const getAssignmentsByCourseId = (courseId: string): Assignment[] => {
  return mockAssignments.filter(assignment => assignment.courseId === courseId);
};

// 辅助函数：根据作业ID获取作业
export const getAssignmentById = (assignmentId: string): Assignment | undefined => {
  return mockAssignments.find(assignment => assignment.id === assignmentId);
};

// 辅助函数：根据课程ID获取课程
export const getCourseById = (courseId: string): ICourse | undefined => {
  return mockCourses.find(course => course._id === courseId);
};

// 统计数据
export const getAssignmentStats = () => {
  return {
    totalAssignments: mockAssignments.length,
    totalCourses: mockCourses.length,
    assignmentsByCourse: mockCourses.map(course => ({
      courseId: course._id,
      courseTitle: course.title,
      assignmentCount: getAssignmentsByCourseId(course._id).length
    }))
  };
};

// 提交记录类型
export interface SubmissionRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: {
    questionId: string;
    answer: string | string[] | null;
  }[];
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

// 模拟提交记录数据 - 持久化的静态数据
export const mockSubmissions: SubmissionRecord[] = [
  {
    id: 'submission-assignment-1',
    assignmentId: 'assignment-1',
    studentId: 'student-1',
    answers: [
      {
        questionId: 'q1-js-basics',
        answer: 'Variables are containers for storing data values'
      },
      {
        questionId: 'q2-js-loops',
        answer: 'for (let i = 0; i < 5; i++) { console.log(i); }'
      },
      {
        questionId: 'q3-js-functions',
        answer: 'function greet(name) { return "Hello " + name; }'
      }
    ],
    submittedAt: '2024-07-15T10:30:00.000Z',
    score: 85,
    feedback: 'Excellent work! Your understanding of JavaScript fundamentals is solid. Consider adding more comments to your code.',
    gradedAt: '2024-07-16T14:20:00.000Z'
  },
  {
    id: 'submission-assignment-2',
    assignmentId: 'assignment-2',
    studentId: 'student-1',
    answers: [
      {
        questionId: 'q1-html-structure',
        answer: '<!DOCTYPE html><html><head><title>My Page</title></head><body><h1>Welcome</h1></body></html>'
      },
      {
        questionId: 'q2-css-styling',
        answer: '.header { background-color: blue; color: white; padding: 20px; }'
      }
    ],
    submittedAt: '2024-07-14T16:45:00.000Z',
    score: 92,
    feedback: 'Great job on the HTML structure and CSS styling. Your code is clean and well-organized.',
    gradedAt: '2024-07-15T09:15:00.000Z'
  },
  {
    id: 'submission-assignment-3',
    assignmentId: 'assignment-3',
    studentId: 'student-1',
    answers: [
      {
        questionId: 'q1-sql-select',
        answer: 'SELECT * FROM users WHERE age > 18 ORDER BY name'
      },
      {
        questionId: 'q2-sql-join',
        answer: 'SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id'
      }
    ],
    submittedAt: '2024-07-13T11:20:00.000Z',
    score: 78,
    feedback: 'Good SQL queries. Try to be more specific with SELECT statements to improve performance.',
    gradedAt: '2024-07-14T13:30:00.000Z'
  },
  {
    id: 'submission-assignment-4',
    assignmentId: 'assignment-4',
    studentId: 'student-1',
    answers: [
      {
        questionId: 'q1-react-component',
        answer: 'function Welcome(props) { return <h1>Hello, {props.name}!</h1>; }'
      },
      {
        questionId: 'q2-react-state',
        answer: 'const [count, setCount] = useState(0);'
      }
    ],
    submittedAt: '2024-07-12T14:10:00.000Z',
    score: 95,
    feedback: 'Excellent React code! You demonstrate a strong understanding of components and hooks.',
    gradedAt: '2024-07-13T10:00:00.000Z'
  },
  {
    id: 'submission-assignment-5',
    assignmentId: 'assignment-5',
    studentId: 'student-1',
    answers: [
      {
        questionId: 'q1-python-basics',
        answer: 'def calculate_average(numbers): return sum(numbers) / len(numbers)'
      },
      {
        questionId: 'q2-python-loops',
        answer: 'for i in range(10): print(f"Number: {i}")'
      }
    ],
    submittedAt: '2024-07-11T09:30:00.000Z',
    score: 88,
    feedback: 'Good Python fundamentals. Consider adding error handling for edge cases.',
    gradedAt: '2024-07-12T15:45:00.000Z'
  },
  {
    id: 'submission-assignment-6',
    assignmentId: 'assignment-6',
    studentId: 'student-1',
    answers: [
      {
        questionId: 'q1-data-analysis',
        answer: 'analysis_report.xlsx'
      },
      {
        questionId: 'q2-data-visualization',
        answer: 'import matplotlib.pyplot as plt; plt.plot(data); plt.show()'
      }
    ],
    submittedAt: '2024-07-10T13:20:00.000Z',
    score: 82,
    feedback: 'Good data analysis approach. Your visualizations clearly show the trends in the data.',
    gradedAt: '2024-07-11T11:10:00.000Z'
  }
];

// 辅助函数：根据作业ID和学生ID获取提交记录
export const getSubmissionByAssignmentAndStudent = (assignmentId: string, studentId: string = 'student-1'): SubmissionRecord | undefined => {
  return mockSubmissions.find(submission => 
    submission.assignmentId === assignmentId && submission.studentId === studentId
  );
};

// 辅助函数：获取学生的所有提交记录
export const getSubmissionsByStudent = (studentId: string = 'student-1'): SubmissionRecord[] => {
  return mockSubmissions.filter(submission => submission.studentId === studentId);
};

// 辅助函数：模拟提交作业
export const submitAssignment = (assignmentId: string, answers: {questionId: string, answer: string | string[] | null}[], studentId: string = 'student-1'): SubmissionRecord => {
  const newSubmission: SubmissionRecord = {
    id: `submission-${assignmentId}-${Date.now()}`,
    assignmentId,
    studentId,
    answers,
    submittedAt: new Date().toISOString(),
    // 暂时不评分，等待教师评分
  };
  
  // 在实际应用中，这里会保存到数据库
  // 现在只是返回新的提交记录
  return newSubmission;
};
