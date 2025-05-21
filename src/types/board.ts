export interface Project {
    id: number;
    name: string;
    isV2?: boolean;
    orgProject?: boolean;
  }
  
  export interface Card {
    id: number | string;
    note: string;
    content_url: string;
    title?: string;
    created_at: string;
    number?: number;
  }
  
  export interface Column {
    id: number | string;
    name: string;
    cards: Card[];
    isV2?: boolean;
    field_id?: string;
    project_id?: number;
  }
  
  export interface MoveCardRequest {
    action: 'moveCard';
    cardId: number | string;
    columnId: number | string;
    position: 'top' | 'bottom';
    isV2?: boolean;
    fieldId?: string;
    projectId?: number;
  }
  
  export interface CreateIssueRequest {
    action: 'createIssue';
    title: string;
    body: string;
    labels: string[];
  }
  
  /**
   * API Error types
   */
  export interface APIError {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  }
  
  export interface APIResponse<T> {
    data?: T;
    error?: APIError;
    success: boolean;
  }
  
  /**
   * API Error utility class
   */
  export class APIErrorHandler {
    static isAPIError(error: unknown): error is APIError {
      return typeof error === 'object' && error !== null && 'message' in error;
    }
  
    static getErrorMessage(error: unknown): string {
      if (this.isAPIError(error)) {
        return error.message;
      }
      if (error instanceof Error) {
        return error.message;
      }
      return 'An unexpected error occurred';
    }
  }