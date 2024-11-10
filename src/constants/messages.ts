export const ERROR_MESSAGES = {
    UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
    CLIPBOARD_ERROR: 'Failed to read clipboard contents. Please try pasting manually.',
    CONNECTION_ERROR: 'Failed to connect to the server. Please check your internet connection.',
    REQUEST_FAILED: (message: string) => `Request failed: ${message}`,
    FEEDBACK_ERROR: 'Failed to submit feedback. Please try again.'
} as const;
