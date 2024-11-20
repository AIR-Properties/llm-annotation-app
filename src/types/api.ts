// API Request types
export interface AskRequest {
  prompt: string;
  propertyLink?: string;
  username: string;
}

export type FeedbackType =
  | "helpful"
  | "not_helpful"
  | "neutral"
  | "perfect"
  | "like"
  | "skip";

export interface FeedbackRequest {
  prompt_id: string;
  answer_id: string;
  feedback?: FeedbackType;
  message?: string;
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
  new_response?: AnnotationResponse;
}

export interface AnnotationResponse {
  id: string;
  title: string;
  text: string;
  timestamp: string;
}

export interface Metadata {
  link?: string;
  [key: string]: any;
}

export interface AnnotationPrompt {
  id: string;
  prompt: string;
  metadata?: Metadata;
  responses: AnnotationResponse[];
}

export interface AnnotationChatMessage {
  id: string;
  type: "response" | "feedback";
  content: string;
  timestamp: string;
}

export interface NewAnnotationResponse {
  prompt_id: string;
  prompt: string;
  metadata?: Metadata;
  response: AnnotationResponse;
}

export type AnnotationsResponse = APIResponse<AnnotationPrompt[]>;
export type NewAnnotationsResponse = APIResponse<NewAnnotationResponse[]>;

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
