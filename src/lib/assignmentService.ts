import { Assignment } from '@/types/assignment';

interface SubmissionRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: {
    questionIndex: number;
    answer: string | string[] | null;
  }[];
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
}

class AssignmentService {
  private baseUrl = '/api';

  async getAssignments(): Promise<Assignment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/assignments`);
      if (!response.ok) {
        console.warn('API request failed, using fallback data');
        return [];
      }
      const data = await response.json();
      return data.assignments || [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    try {
      const assignments = await this.getAssignments();
      const assignment = assignments.find(
        (a) => (a._id || a.id) === assignmentId
      );
      if (assignment) {
        return assignment;
      }

      const response = await fetch(
        `${this.baseUrl}/courses/all/assessments/${assignmentId}`
      );
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.assignment || null;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      return null;
    }
  }

  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const mockCourses = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Web Development Fundamentals',
          description: 'Learn web development',
          instructor: 'Dr. Sarah Johnson',
        },
        {
          _id: '507f1f77bcf86cd799439012',
          title: 'Database Systems and SQL',
          description: 'Learn databases',
          instructor: 'Prof. Michael Chen',
        },
        {
          _id: '507f1f77bcf86cd799439013',
          title: 'Data Structures and Algorithms',
          description: 'Learn algorithms',
          instructor: 'Dr. Alex Rodriguez',
        },
        {
          _id: '507f1f77bcf86cd799439014',
          title: 'UI/UX Design Principles',
          description: 'Learn design',
          instructor: 'Emily Thompson',
        },
        {
          _id: '507f1f77bcf86cd799439015',
          title: 'Introduction to Machine Learning',
          description: 'Learn ML',
          instructor: 'Dr. Lisa Wang',
        },
      ];

      return mockCourses.find((c) => c._id === courseId) || null;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  }

  async getSubmissionByAssignmentAndStudent(
    assignmentId: string,
    studentId: string = 'student-1'
  ): Promise<SubmissionRecord | null> {
    try {
      // 模拟的提交记录 - 在实际环境中会从 API 获取
      const mockSubmissions: SubmissionRecord[] = [
        {
          id: 'submission-react-intro-1',
          assignmentId: 'assignment-react-intro',
          studentId: 'student-1',
          answers: [
            {
              questionIndex: 0,
              answer:
                'Functional components are simpler and use hooks for state management, while class components use this.state and lifecycle methods',
            },
            {
              questionIndex: 1,
              answer:
                'Props are read-only data passed from parent to child components. State is mutable data managed within a component.',
            },
            { questionIndex: 2, answer: 'react-project.zip' },
          ],
          submittedAt: '2024-07-15T10:30:00.000Z',
          score: 85,
          feedback:
            'Excellent work! Your understanding of React fundamentals is solid.',
          gradedAt: '2024-07-16T14:20:00.000Z',
        },
      ];

      return (
        mockSubmissions.find(
          (s) => s.assignmentId === assignmentId && s.studentId === studentId
        ) || null
      );
    } catch (error) {
      console.error('Error fetching submission:', error);
      return null;
    }
  }

  async submitAssignment(
    assignmentId: string,
    answers: { questionIndex: number; answer: string | string[] | null }[],
    studentId: string = 'student-1'
  ): Promise<SubmissionRecord> {
    try {
      const response = await fetch(
        `${this.baseUrl}/courses/all/assessments/${assignmentId}/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId,
            answers,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit assignment');
      }

      const data = await response.json();
      return data.submission;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return {
        id: `submission-${assignmentId}-${Date.now()}`,
        assignmentId,
        studentId,
        answers,
        submittedAt: new Date().toISOString(),
      };
    }
  }
}

export const assignmentService = new AssignmentService();

export const getAssignmentById = (assignmentId: string) =>
  assignmentService.getAssignmentById(assignmentId);
export const getCourseById = (courseId: string) =>
  assignmentService.getCourseById(courseId);
export const getSubmissionByAssignmentAndStudent = (
  assignmentId: string,
  studentId?: string
) =>
  assignmentService.getSubmissionByAssignmentAndStudent(
    assignmentId,
    studentId
  );
export const submitAssignment = (
  assignmentId: string,
  answers: { questionIndex: number; answer: string | string[] | null }[],
  studentId?: string
) => assignmentService.submitAssignment(assignmentId, answers, studentId);

export const mockAssignments: Assignment[] = [];

export type { SubmissionRecord };
