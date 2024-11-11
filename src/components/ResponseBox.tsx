import React, { useCallback } from "react";
import { annotationService } from "../services/api";
import { getUserName } from "../utils/auth";
import "./ResponseBox.css";

interface ResponseBoxProps {
  title: string;
  text: string;
  feedback?: "helpful" | "not_helpful";
  prompt_id: string;
  response_id: string;
  onFeedbackChange?: (feedback: "helpful" | "not_helpful" | undefined) => void;
  onError?: (error: string) => void;
}

const ResponseBox: React.FC<ResponseBoxProps> = ({
  title,
  text,
  feedback,
  prompt_id,
  response_id,
  onFeedbackChange,
  onError,
}) => {
  const handleFeedback = useCallback(
    async (newFeedback: "helpful" | "not_helpful") => {
      try {
        const username = getUserName();
        if (!username) {
          onError?.("User not authenticated");
          return;
        }

        await annotationService.submitFeedback({
          prompt_id,
          response_id,
          feedback: newFeedback,
          username,
        });
        onFeedbackChange?.(newFeedback);
      } catch (err) {
        console.error("Error submitting feedback:", err);
        onError?.(
          err instanceof Error ? err.message : "Failed to submit feedback"
        );
      }
    },
    [prompt_id, response_id, onFeedbackChange, onError]
  );

  return (
    <div className="response-box">
      <div className="response-box-title">{title}</div>
      <div className="response-box-text">{text}</div>
      <div className="response-box-buttons">
        <button
          className={`response-box-button helpful ${
            feedback === "helpful" ? "selected" : ""
          }`}
          onClick={() => handleFeedback("helpful")}
          disabled={feedback !== undefined}
        >
          Mark as Helpful
        </button>
        <button
          className={`response-box-button not-helpful ${
            feedback === "not_helpful" ? "selected" : ""
          }`}
          onClick={() => handleFeedback("not_helpful")}
          disabled={feedback !== undefined}
        >
          Mark as Not Helpful
        </button>
      </div>
    </div>
  );
};

export default ResponseBox;
