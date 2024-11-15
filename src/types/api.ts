// API Request types
export interface AskRequest {
  prompt: string;
  propertyLink?: string;
  username: string;
}

export type FeedbackType = "helpful" | "not_helpful" | "neutral";

export interface FeedbackRequest {
  prompt_id: string;
  response_id: string;
  feedback: FeedbackType;
  username: string;
}

export interface GetAnnotationsRequest {
  username: string;
}

// API Response types
export interface APIResponse<T> {
  message: string;
  data: T;
}

export interface Response {
  id: string;
  title: string;
  text: string;
}

export interface AskResponse {
  id: string; // Prompt ID
  responses: Response[];
}

export interface FeedbackResponse {
  success: boolean;
  message?: string;
}

export interface AnnotationResponse {
  id: string;
  title: string;
  text: string;
}

export interface AnnotationPrompt {
  id: string;
  prompt: string;
  responses: AnnotationResponse[];
}

export type AnnotationsResponse = APIResponse<AnnotationPrompt[]>;

// Type guards
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

// API Error type
export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}
