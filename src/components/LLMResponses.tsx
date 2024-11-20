import React, { useState, useCallback } from "react";
import ResponseList from "./ResponseList";
import PromptInput from "./PromptInput";
import Toast from "./Toast";
import BackButton from "./BackButton";
import { annotationService, APIError } from "../services/api";
import { mapAskResponseToDomain } from "../utils/mappers";
import { ERROR_MESSAGES } from "../constants/messages";
import { Response as DomainResponse, FeedbackType } from "../types/domain";
import { getUserName } from "../utils/auth";
import "./LLMResponses.css";

const LLMResponses: React.FC = () => {
  const [results, setResults] = useState<DomainResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (prompt: string, propertyLink: string) => {
      try {
        setIsLoading(true);
        const username = getUserName();
        if (!username) {
          setError("User not authenticated");
          return;
        }

        const response = await annotationService.ask({
          prompt,
          propertyLink,
          username,
        });

        const mappedResults = mapAskResponseToDomain(response);
        setResults(mappedResults);
      } catch (err) {
        console.error("Error submitting prompt:", err);
        if (err instanceof APIError) {
          setError(ERROR_MESSAGES.REQUEST_FAILED(err.message));
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(ERROR_MESSAGES.UNEXPECTED_ERROR);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleFeedbackChange = useCallback(
    async (resultId: string, feedback: FeedbackType | undefined) => {
      try {
        const username = getUserName();
        if (!username || !feedback) {
          setError("User not authenticated or invalid feedback");
          return;
        }

        // Update local state immediately for better UX
        setResults((prevResults) =>
          prevResults.map((result) =>
            result.id === resultId ? { ...result, feedback } : result
          )
        );

        // Find the prompt_id for the result
        const result = results.find((r) => r.id === resultId);
        if (!result) {
          setError("Response not found");
          return;
        }

        // Submit feedback to server
        await annotationService.submitFeedback({
          prompt_id: result.prompt_id,
          answer_id: resultId,
          feedback,
          username,
        });
      } catch (err) {
        console.error("Error submitting feedback:", err);
        if (err instanceof APIError) {
          setError(ERROR_MESSAGES.REQUEST_FAILED(err.message));
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(ERROR_MESSAGES.UNEXPECTED_ERROR);
        }
      }
    },
    [results]
  );

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  return (
    <div className="llm-responses-container">
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
      <BackButton to="/" />
      <PromptInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onError={handleError}
      />
      <ResponseList
        results={results}
        onFeedbackChange={handleFeedbackChange}
        onError={handleError}
      />
    </div>
  );
};

export default LLMResponses;
