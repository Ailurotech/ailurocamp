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
        `${this.baseUrl}/assessments/${assignmentId}`
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
      const response = await fetch(`${this.baseUrl}/courses/${courseId}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.course || null;
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
      const response = await fetch(
        `${this.baseUrl}/assessments/${assignmentId}/submissions/${studentId}`
      );
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.submission || null;
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
        `${this.baseUrl}/assessments/${assignmentId}/submissions`,
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
