import React, { useCallback, useState } from "react";
import { annotationService } from "../services/api";
import { getUserName } from "../utils/auth";
import CopyIcon from "./CopyIcon";
import "./ResponseBox.css";

interface ResponseBoxProps {
  title: string;
  text: string;
  feedback?: "helpful" | "not_helpful" | "neutral";
  prompt_id: string;
  answer_id: string;
  created_at?: string;
  onFeedbackChange?: (
    feedback: "helpful" | "not_helpful" | "neutral" | undefined
  ) => void;
  onError?: (error: string) => void;
}

const ResponseBox: React.FC<ResponseBoxProps> = ({
  title,
  text,
  feedback,
  prompt_id,
  answer_id,
  created_at,
  onFeedbackChange,
  onError,
}) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleFeedback = useCallback(
    async (newFeedback: "helpful" | "not_helpful" | "neutral") => {
      try {
        const username = getUserName();
        if (!username) {
          onError?.("User not authenticated");
          return;
        }

        await annotationService.submitFeedback({
          prompt_id,
          answer_id,
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
    [prompt_id, answer_id, onFeedbackChange, onError]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
      onError?.("Failed to copy text to clipboard");
    }
  }, [text, onError]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="response-box">
      <div className="response-box-header">
        <div className="title-timestamp">
          <div className="response-box-title">{title}</div>
          {created_at && (
            <div className="response-timestamp">{formatDate(created_at)}</div>
          )}
        </div>
        <div className="copy-wrapper">
          <button
            className="copy-button"
            onClick={handleCopy}
            title="Copy response"
          >
            <span className="copy-icon">
              <CopyIcon />
            </span>
            <span className="copy-text">{showCopied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
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
          className={`response-box-button neutral ${
            feedback === "neutral" ? "selected" : ""
          }`}
          onClick={() => handleFeedback("neutral")}
          disabled={feedback !== undefined}
        >
          Mark as Neutral
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
