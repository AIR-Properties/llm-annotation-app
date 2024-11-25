import {
  FeedbackType,
  ErrorHandler,
  FeedbackHandler,
  SubmitHandler,
  UIResponse,
} from "./domain";

// Common Props
export interface WithChildren {
  children: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

// Toast Component
export interface ToastProps extends WithClassName {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}

// Response Components
export interface ResponseBoxProps extends WithClassName {
  title: string;
  text: string;
  feedback?: FeedbackType;
  prompt_id: string;
  answer_id: string;
  created_at?: string;
  onFeedbackChange?: (feedback: FeedbackType | undefined) => void;
  onError?: ErrorHandler;
}

export interface ResponseListProps extends WithClassName {
  results: ReadonlyArray<UIResponse>;
  onFeedbackChange?: FeedbackHandler;
  onError: ErrorHandler;
}

// Input Components
export interface PromptInputProps extends WithClassName {
  onSubmit: SubmitHandler;
  isLoading: boolean;
  onError: ErrorHandler;
}

// Layout Components
export interface FooterProps extends WithClassName {
  author?: string;
}

// Container Components
export interface ContainerProps extends WithClassName {
  title?: string;
  backLink?: string;
  showFooter?: boolean;
  children: React.ReactNode;
}

// Utility Types
export type ComponentSize = "small" | "medium" | "large";
export type ComponentVariant = "primary" | "secondary" | "error" | "success";

export interface BaseButtonProps extends WithClassName {
  size?: ComponentSize;
  variant?: ComponentVariant;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
