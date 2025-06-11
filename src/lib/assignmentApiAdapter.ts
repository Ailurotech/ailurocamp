/**
 * Assignment API Adapter
 * 基于 Assessment 模型的作业 API 适配器
 */

import { AssignmentApiRequest, AssignmentApiResponse, AssignmentListResponse } from '@/types/assignment';

// API 配置
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export class AssignmentApiAdapter {
  /**
   * 获取作业列表
   */
  async getAssignments(courseId: string): Promise<AssignmentListResponse> {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    const response = await fetch(`${API_BASE}/api/courses/${courseId}/assessments`);
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    
    const data: AssignmentListResponse = await response.json();
    return data;
  }  /**
   * 获取单个作业
   */
  async getAssignment(courseId: string, assignmentId: string): Promise<AssignmentApiResponse> {
    if (!courseId || !assignmentId) {
      throw new Error('Course ID and Assignment ID are required');
    }
    
    const response = await fetch(`${API_BASE}/api/courses/${courseId}/assessments/${assignmentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch assignment');
    }
    
    return response.json();
  }  /**
   * 创建作业
   */  async createAssignment(
    courseId: string,
    assignmentData: AssignmentApiRequest
  ): Promise<AssignmentApiResponse> {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    console.log('Creating assignment with data:', { courseId, assignmentData });
    console.log('Assignment data details:');
    console.log('  title:', assignmentData.title);
    console.log('  description:', assignmentData.description);
    console.log('  dueDate:', assignmentData.dueDate);
    console.log('  points:', assignmentData.points);
    console.log('API URL:', `${API_BASE}/api/courses/${courseId}/assessments`);
    console.log('Request body to be sent:', JSON.stringify(assignmentData, null, 2));
    
    const response = await fetch(`${API_BASE}/api/courses/${courseId}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Assignment creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to create assignment: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Assignment created successfully:', result);
    return result;
  }/**
   * 更新作业
   */
  async updateAssignment(
    courseId: string,
    assignmentId: string,
    assignmentData: AssignmentApiRequest
  ): Promise<AssignmentApiResponse> {    if (!courseId || !assignmentId) {
      throw new Error('Course ID and Assignment ID are required');
    }

    const response = await fetch(`${API_BASE}/api/courses/${courseId}/assessments/${assignmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to update assignment');
    }
    
    return response.json();
  }
  /**
   * 删除作业
   */  async deleteAssignment(courseId: string, assignmentId: string): Promise<{ success: boolean; message: string }> {
    if (!courseId || !assignmentId) {
      throw new Error('Course ID and Assignment ID are required');
    }

    const response = await fetch(`${API_BASE}/api/courses/${courseId}/assessments/${assignmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete assignment');
    }

    return response.json();
  }
}
