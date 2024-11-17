import React, { useState, useCallback, useEffect, useRef } from "react";
import BackButton from "./BackButton";
import { annotationService } from "../services/api";
import { NewAnnotationResponse } from "../types/api";
import { SAMPLE_NEW_ANNOTATIONS } from "../data/sampleData";
import { getUserName } from "../utils/auth";
import "./Annotations.css";

interface ChatMessage {
  id: string;
  type: "response" | "feedback" | "error" | "typing";
  content: string;
  timestamp: string;
  feedbackText?: string;
}

const Annotations: React.FC = () => {
  const [prompts, setPrompts] = useState<NewAnnotationResponse[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentPrompt = prompts[currentPromptIndex];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const addErrorMessage = (feedbackText?: string) => {
    setChatMessages((prev) => [
      ...prev.filter((msg) => msg.type !== "typing"),
      {
        id: `error-${Date.now()}`,
        type: "error",
        content: "Sorry, there was an issue. Try again.",
        timestamp: new Date().toISOString(),
        feedbackText,
      },
    ]);
  };

  const moveToNextPrompt = useCallback(() => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
      const nextPrompt = prompts[currentPromptIndex + 1];
      setChatMessages([
        {
          id: nextPrompt.response.id,
          type: "response",
          content: nextPrompt.response.text,
          timestamp: nextPrompt.response.timestamp,
        },
      ]);
    } else {
      setChatMessages([
        {
          id: "end",
          type: "response",
          content: "No more prompts available.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [currentPromptIndex, prompts]);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const username = getUserName();
        if (!username) {
          addErrorMessage();
          return;
        }

        const response = await annotationService.getNewAnnotations({
          username,
        });

        if (response.data.length > 0) {
          setPrompts(response.data);
          setChatMessages([
            {
              id: response.data[0].response.id,
              type: "response",
              content: response.data[0].response.text,
              timestamp: response.data[0].response.timestamp,
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching annotations:", err);
        addErrorMessage();
        // Keep showing sample data on error
        const sampleData = SAMPLE_NEW_ANNOTATIONS.data;
        setPrompts(sampleData);
        if (sampleData.length > 0) {
          setChatMessages([
            {
              id: sampleData[0].response.id,
              type: "response",
              content: sampleData[0].response.text,
              timestamp: sampleData[0].response.timestamp,
            },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnotations();
  }, []);

  const handleFeedbackAction = useCallback(
    async (feedback: "perfect" | "like") => {
      if (!currentPrompt) return;

      try {
        setIsSubmitting(true);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `typing-${Date.now()}`,
            type: "typing",
            content: "",
            timestamp: new Date().toISOString(),
          },
        ]);
        await annotationService.submitAnnotationFeedback({
          prompt_id: currentPrompt.prompt_id,
          response_id: currentPrompt.response.id,
          feedback,
          username: getUserName() || "",
        });

        setChatMessages((prev) => [
          ...prev.filter((msg) => msg.type !== "typing"),
          {
            id: `feedback-${Date.now()}`,
            type: "feedback",
            content:
              feedback === "perfect"
                ? "Perfect ✨"
                : feedback === "like"
                ? "Liked 👍"
                : "",
            timestamp: new Date().toISOString(),
          },
        ]);

        moveToNextPrompt();
      } catch (err) {
        addErrorMessage();
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentPrompt, moveToNextPrompt]
  );

  const submitFeedback = useCallback(
    async (text: string) => {
      if (!currentPrompt) return;

      const messageId = `feedback-${Date.now()}`;
      setChatMessages((prev) => [
        ...prev,
        {
          id: messageId,
          type: "feedback",
          content: text,
          timestamp: new Date().toISOString(),
          feedbackText: text,
        },
      ]);

      try {
        setIsSubmitting(true);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `typing-${Date.now()}`,
            type: "typing",
            content: "",
            timestamp: new Date().toISOString(),
          },
        ]);

        await new Promise((resolve) => setTimeout(resolve, 100)); // Add delay

        const response = await annotationService.submitAnnotationFeedback({
          prompt_id: currentPrompt.prompt_id,
          response_id: currentPrompt.response.id,
          feedback: "not_helpful",
          feedback_text: text,
          username: getUserName() || "",
        });

        if (response.new_response) {
          const newResponse = response.new_response;
          setChatMessages((prev) => [
            ...prev.filter((msg) => msg.type !== "typing"),
            {
              id: newResponse.id,
              type: "response",
              content: newResponse.text,
              timestamp: newResponse.timestamp,
            },
          ]);
        }
      } catch (err) {
        addErrorMessage(text);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentPrompt]
  );

  const handleFeedbackSubmit = useCallback(async () => {
    if (!currentPrompt || !feedbackText.trim()) return;
    await submitFeedback(feedbackText);
    setFeedbackText("");
  }, [currentPrompt, feedbackText, submitFeedback]);

  const handleRetry = useCallback(
    async (errorMessage: ChatMessage) => {
      if (!errorMessage.feedbackText) return;
      await submitFeedback(errorMessage.feedbackText);
    },
    [submitFeedback]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && feedbackText.trim()) {
        handleFeedbackSubmit();
      }
    },
    [feedbackText, handleFeedbackSubmit]
  );

  if (isLoading) {
    return <div className="annotations-container loading">Loading...</div>;
  }

  return (
    <div className="annotations-container">
      <BackButton to="/" />

      {currentPrompt && (
        <>
          <div className="prompt-section">
            <div className="prompt-title">{currentPrompt.prompt}</div>
            {currentPrompt.metadata?.link && (
              <a
                href={currentPrompt.metadata.link}
                target="_blank"
                rel="noopener noreferrer"
                className="metadata-link"
              >
                View Property Details →
              </a>
            )}
          </div>

          <div className="chat-section">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${
                  message.type === "feedback"
                    ? "user-message"
                    : message.type === "typing"
                    ? "typing-message"
                    : "ai-message"
                }`}
              >
                <div className="message-content">
                  {message.type === "typing" ? (
                    <div className="typing-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                {message.type === "error" && message.feedbackText && (
                  <button
                    className="retry-button"
                    onClick={() => handleRetry(message)}
                  >
                    Try Again
                  </button>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="feedback-section">
            <div className="feedback-buttons">
              <button
                className="perfect-button"
                onClick={() => handleFeedbackAction("perfect")}
                disabled={isSubmitting}
              >
                Perfect ✨
              </button>
              <button
                className="like-button"
                onClick={() => handleFeedbackAction("like")}
                disabled={isSubmitting}
              >
                Like 👍
              </button>
              <button
                className="skip-button"
                onClick={moveToNextPrompt}
                disabled={isSubmitting}
              >
                Skip ⏭️
              </button>
            </div>
            <div className="feedback-input-container">
              <input
                type="text"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Or provide feedback here..."
                className="feedback-input"
                disabled={isSubmitting}
              />
              <button
                className="submit-button"
                onClick={handleFeedbackSubmit}
                disabled={!feedbackText.trim() || isSubmitting}
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Annotations;
