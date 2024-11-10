import API_CONFIG from '../config/api';
import { 
    AskRequest, 
    AskResponse, 
    FeedbackRequest, 
    FeedbackResponse,
    AnnotationsResponse,
    GetAnnotationsRequest 
} from '../types/api';
import { ERROR_MESSAGES } from '../constants/messages';

export class APIError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'APIError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new APIError(
            response.status,
            `API request failed with status ${response.status}`
        );
    }

    const data = await response.json();
    return data;
}

async function makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: unknown
): Promise<T> {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method,
            headers: API_CONFIG.DEFAULT_HEADERS,
            body: body ? JSON.stringify(body) : undefined,
        });

        return handleResponse<T>(response);
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new Error(ERROR_MESSAGES.CONNECTION_ERROR);
    }
}

export const annotationService = {
    ask: async (request: AskRequest): Promise<AskResponse> => {
        return makeRequest<AskResponse>(
            API_CONFIG.ENDPOINTS.ASK,
            'POST',
            request
        );
    },

    submitFeedback: async (request: FeedbackRequest): Promise<FeedbackResponse> => {
        return makeRequest<FeedbackResponse>(
            API_CONFIG.ENDPOINTS.FEEDBACK,
            'POST',
            request
        );
    },

    getAnnotations: async (request: GetAnnotationsRequest): Promise<AnnotationsResponse> => {
        return makeRequest<AnnotationsResponse>(
            API_CONFIG.ENDPOINTS.DATA,
            'POST',
            request
        );
    }
};
