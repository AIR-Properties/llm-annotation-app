export type FeedbackType = 'helpful' | 'not_helpful';

export interface Response {
    id: string;
    title: string;
    text: string;
    prompt_id: string;
    response_id: string;
}

export interface UIResponse extends Response {
    feedback?: FeedbackType;
}

export interface Prompt {
    id: string;
    text: string;
    propertyLink?: string;
}

// State types
export type ErrorState = string | null;
export type LoadingState = boolean;
export type ResultsState = UIResponse[];

// Event handler types
export type FeedbackHandler = (resultId: string, feedback: FeedbackType | undefined) => void;
export type ErrorHandler = (error: string) => void;
export type SubmitHandler = (prompt: string, propertyLink: string) => Promise<void>;
