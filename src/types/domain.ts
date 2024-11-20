export type FeedbackType = "helpful" | "not_helpful" | "neutral";

export interface Metadata {
  link?: string;
  [key: string]: any;
}

export interface Response {
  id: string;
  title: string;
  text: string;
  prompt_id: string;
  answer_id: string;
}

export interface UIResponse extends Response {
  feedback?: FeedbackType;
}

export interface Prompt {
  id: string;
  text: string;
  propertyLink?: string;
  metadata?: Metadata;
}

// State types
export type ErrorState = string | null;
export type LoadingState = boolean;
export type ResultsState = UIResponse[];

// Event handler types
export type FeedbackHandler = (
  resultId: string,
  feedback: FeedbackType | undefined
) => void;
export type ErrorHandler = (error: string) => void;
export type SubmitHandler = (
  prompt: string,
  propertyLink: string
) => Promise<void>;
