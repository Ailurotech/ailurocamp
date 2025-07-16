import {
  AssignmentApiRequest,
  AssignmentApiResponse,
  AssignmentListResponse,
} from '@/types/assignment';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export class AssignmentApiAdapter {
  async getAssignments(courseId: string): Promise<AssignmentListResponse> {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    const response = await fetch(
      `${API_BASE}/api/courses/${courseId}/assessments`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }

    const data: AssignmentListResponse = await response.json();
    return data;
  }

  async getAssignment(
    courseId: string,
    assignmentId: string
  ): Promise<AssignmentApiResponse> {
    if (!courseId || !assignmentId) {
      throw new Error('Course ID and Assignment ID are required');
    }

    const response = await fetch(
      `${API_BASE}/api/courses/${courseId}/assessments/${assignmentId}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch assignment');
    }
    return response.json();
  }

  async createAssignment(
    courseId: string,
    assignmentData: AssignmentApiRequest
  ): Promise<AssignmentApiResponse> {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    const response = await fetch(
      `${API_BASE}/api/courses/${courseId}/assessments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create assignment: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    return result;
  }

  async updateAssignment(
    courseId: string,
    assignmentId: string,
    assignmentData: AssignmentApiRequest
  ): Promise<AssignmentApiResponse> {
    if (!courseId || !assignmentId) {
      throw new Error('Course ID and Assignment ID are required');
    }

    const response = await fetch(
      `${API_BASE}/api/courses/${courseId}/assessments/${assignmentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update assignment');
    }
    return response.json();
  }

  async deleteAssignment(
    courseId: string,
    assignmentId: string
  ): Promise<{ success: boolean; message: string }> {
    if (!courseId || !assignmentId) {
      throw new Error('Course ID and Assignment ID are required');
    }

    const response = await fetch(
      `${API_BASE}/api/courses/${courseId}/assessments/${assignmentId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete assignment');
    }

    return response.json();
  }

  // 提交作业答案
  async submitAssignment(
    courseId: string,
    assignmentId: string,
    answers: { questionId: string; answer: string | string[] | null }[]
  ): Promise<{
    id: string;
    assignmentId: string;
    studentId: string;
    answers: { questionId: string; answer: string | string[] | null }[];
    submittedAt: string;
    score?: number;
    feedback?: string;
    gradedAt?: string;
  }> {
    if (!courseId || !assignmentId) {
      throw new Error('Course ID and Assignment ID are required');
    }

    const response = await fetch(
      `${API_BASE}/api/courses/${courseId}/assessments/${assignmentId}/submissions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          submittedAt: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to submit assignment: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  // 获取作业提交记录
  async getSubmission(
    courseId: string,
    assignmentId: string
  ): Promise<{
    id: string;
    assignmentId: string;
    studentId: string;
    answers: { questionId: string; answer: string | string[] | null }[];
    submittedAt: string;
    score?: number;
    feedback?: string;
    gradedAt?: string;
  }> {
    if (!courseId || !assignmentId) {
      throw new Error('Course ID and Assignment ID are required');
    }

    const response = await fetch(
      `${API_BASE}/api/courses/${courseId}/assessments/${assignmentId}/submissions`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No submission found');
      }
      throw new Error('Failed to fetch submission');
    }

    return response.json();
  }

  // 检查作业是否已提交
  async hasSubmitted(courseId: string, assignmentId: string): Promise<boolean> {
    try {
      await this.getSubmission(courseId, assignmentId);
      return true;
    } catch {
      return false;
    }
  }
}
