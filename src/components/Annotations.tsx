import React, { useState, useCallback, useEffect, useRef } from "react";
import BackButton from "./BackButton";
import { annotationService } from "../services/api";
import { AnnotationPrompt } from "../types/api";
import { SAMPLE_ANNOTATIONS } from "../data/sampleData";
import { getUserName } from "../utils/auth";
import "./Annotations.css";

interface ChatMessage {
  id: string;
  type: "response" | "feedback" | "error" | "typing";
  content: string;
  created_at: string;
  feedbackText?: string;
}

const Annotations: React.FC = () => {
  const [prompts, setPrompts] = useState<AnnotationPrompt[]>([]);
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
        created_at: new Date().toISOString(),
        feedbackText,
      },
    ]);
  };

  const moveToNextPrompt = useCallback(() => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex((prev) => prev + 1);
      const nextPrompt = prompts[currentPromptIndex + 1];
      // Get the latest AIR response
      const latestAirResponse = nextPrompt?.responses
        ?.filter((response) => response.title === "AIR")
        ?.slice(-1)[0];
      if (latestAirResponse) {
        setChatMessages([
          {
            id: latestAirResponse.id,
            type: "response",
            content: latestAirResponse.text,
            created_at: latestAirResponse.created_at,
          },
        ]);
      }
    } else {
      setChatMessages([
        {
          id: "end",
          type: "response",
          content: "No more prompts available.",
          created_at: new Date().toISOString(),
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

        const response = await annotationService.getAnnotations({
          username,
        });

        if (response?.data?.length > 0) {
          setPrompts(response.data);
          // Get the latest AIR response from the first prompt
          const latestAirResponse = response.data[0].responses
            ?.filter((response) => response.title === "AIR")
            ?.slice(-1)[0];
          if (latestAirResponse) {
            setChatMessages([
              {
                id: latestAirResponse.id,
                type: "response",
                content: latestAirResponse.text,
                created_at: latestAirResponse.created_at,
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Error fetching annotations:", err);
        addErrorMessage();
        // Keep showing sample data on error
        if (SAMPLE_ANNOTATIONS?.data?.length > 0) {
          setPrompts(SAMPLE_ANNOTATIONS.data);
          const latestAirResponse = SAMPLE_ANNOTATIONS.data[0].responses
            ?.filter((response) => response.title === "AIR")
            ?.slice(-1)[0];
          if (latestAirResponse) {
            setChatMessages([
              {
                id: latestAirResponse.id,
                type: "response",
                content: latestAirResponse.text,
                created_at: latestAirResponse.created_at,
              },
            ]);
          }
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
            created_at: new Date().toISOString(),
          },
        ]);

        const latestAirResponse = currentPrompt.responses
          ?.filter((response) => response.title === "AIR")
          ?.slice(-1)[0];

        if (latestAirResponse) {
          await annotationService.submitAnnotationFeedback({
            prompt_id: currentPrompt.id,
            answer_id: latestAirResponse.id,
            feedback,
            username: getUserName() || "",
          });
        }

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
            created_at: new Date().toISOString(),
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
          created_at: new Date().toISOString(),
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
            created_at: new Date().toISOString(),
          },
        ]);

        await new Promise((resolve) => setTimeout(resolve, 100)); // Add delay

        const latestAirResponse = currentPrompt.responses
          ?.filter((response) => response.title === "AIR")
          ?.slice(-1)[0];

        if (latestAirResponse) {
          const response = await annotationService.submitAnnotationFeedback({
            prompt_id: currentPrompt.id,
            answer_id: latestAirResponse.id,
            message: text,
            username: getUserName() || "",
          });

          // Only add response message if it exists
          if (response.message) {
            setChatMessages((prev) => [
              ...prev.filter((msg) => msg.type !== "typing"),
              {
                id: `response-${Date.now()}`,
                type: "response",
                content: response.message,
                created_at: new Date().toISOString(),
              } as ChatMessage,
            ]);
          }
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
                  {new Date(message.created_at).toLocaleTimeString()}
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
