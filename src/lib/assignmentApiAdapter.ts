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
}
