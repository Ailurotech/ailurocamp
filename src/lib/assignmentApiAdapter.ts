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
    if (!assignmentId) {
      throw new Error('Assignment ID is required');
    }

    // 使用新的简化API路径，不需要courseId
    const response = await fetch(
      `${API_BASE}/api/assessments/${assignmentId}`
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


  async submitAssignment(
    courseId: string,
    assignmentId: string,
    answers: { questionId: string; answer: string | string[] | null }[],
    studentId: string = 'student-1' // 添加studentId参数，保持向后兼容
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
    if (!assignmentId) {
      throw new Error('Assignment ID is required');
    }

    // 转换为新API期望的格式
    const submissionData = {
      studentId: studentId, // 使用传入的studentId
      answers: answers.map((answer, index) => ({
        questionIndex: index,
        answer: answer.answer,
      })),
    };

    const response = await fetch(
      `${API_BASE}/api/assessments/${assignmentId}/submissions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to submit assignment: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    
    // 转换回旧格式以保持兼容性
    return {
      id: result.id,
      assignmentId: result.assignmentId,
      studentId: result.studentId,
      answers: answers, // 保持原有格式
      submittedAt: result.submittedAt,
      score: result.score,
      feedback: result.feedback,
      gradedAt: result.gradedAt,
    };
  }

  
  async getSubmission(
    courseId: string,
    assignmentId: string,
    studentId: string = 'student-1' // 添加studentId参数
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
    if (!assignmentId) {
      throw new Error('Assignment ID is required');
    }

    const response = await fetch(
      `${API_BASE}/api/assessments/${assignmentId}/submissions/${studentId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No submission found');
      }
      throw new Error('Failed to fetch submission');
    }

    const result = await response.json();
    
    // 转换格式以保持兼容性
    return {
      id: result.submission.id,
      assignmentId: result.submission.assignmentId,
      studentId: result.submission.studentId,
      answers: result.submission.answers.map((answer: { questionIndex: number; answer: string | string[] }, index: number) => ({
        questionId: `question-${index}`,
        answer: answer.answer,
      })),
      submittedAt: result.submission.submittedAt,
      score: result.submission.score,
      feedback: result.submission.feedback,
      gradedAt: result.submission.gradedAt,
    };
  }

  
  async hasSubmitted(courseId: string, assignmentId: string, studentId: string = 'student-1'): Promise<boolean> {
    try {
      await this.getSubmission(courseId, assignmentId, studentId);
      return true;
    } catch {
      return false;
    }
  }
}
