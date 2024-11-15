import React, { useState, useCallback, useEffect, useRef } from "react";
import ResponseList from "./ResponseList";
import Toast from "./Toast";
import Footer from "./Footer";
import BackButton from "./BackButton";
import { annotationService, APIError } from "../services/api";
import { mapAnnotationsToDomain } from "../utils/mappers";
import { ERROR_MESSAGES } from "../constants/messages";
import {
  Response as DomainResponse,
  FeedbackType,
  Metadata,
} from "../types/domain";
import { SAMPLE_ANNOTATIONS } from "../data/sampleData";
import { getUserName } from "../utils/auth";
import "./Annotations.css";

interface AnnotationResponse extends DomainResponse {
  feedback?: FeedbackType;
}

interface AnnotationBox {
  id: string;
  title: string;
  prompt: string;
  metadata?: Metadata;
  responses: AnnotationResponse[];
  isExpanded: boolean;
  isClosing?: boolean;
}

const Annotations: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationBox[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const username = getUserName();
        if (!username) {
          setError("User not authenticated");
          return;
        }

        const response = await annotationService.getAnnotations({ username });
        const mappedData = mapAnnotationsToDomain(response);
        setAnnotations(
          mappedData.map((item) => ({
            ...item,
            isExpanded: true,
            responses: item.responses,
          }))
        );
      } catch (err) {
        console.error("Error fetching annotations:", err);
        if (err instanceof APIError) {
          setError(ERROR_MESSAGES.REQUEST_FAILED(err.message));
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(ERROR_MESSAGES.UNEXPECTED_ERROR);
        }
        // Keep showing sample data on error
        setAnnotations(
          mapAnnotationsToDomain(SAMPLE_ANNOTATIONS).map((item) => ({
            ...item,
            isExpanded: true,
            responses: item.responses,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnotations();
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < annotations.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, annotations.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      // minimum swipe distance
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  const handleFeedbackChange = useCallback(
    (resultId: string, newFeedback: FeedbackType | undefined) => {
      const currentAnnotation = annotations[currentIndex];
      setAnnotations((prevAnnotations) => {
        const newAnnotations = [...prevAnnotations];
        const annotation = newAnnotations[currentIndex];
        if (annotation) {
          annotation.responses = annotation.responses.map((response) =>
            response.id === resultId
              ? { ...response, feedback: newFeedback }
              : response
          );
        }
        return newAnnotations;
      });
    },
    [annotations, currentIndex]
  );

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  if (isLoading) {
    return <div className="annotations-container loading">Loading...</div>;
  }

  const currentAnnotation = annotations[currentIndex];

  return (
    <div
      className="annotations-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
      <BackButton to="/" />

      <div className="content-wrapper">
        {currentAnnotation && (
          <div className="annotation-box">
            <div className="prompt-section">
              <div className="prompt-title">{currentAnnotation.prompt}</div>
              {currentAnnotation.metadata?.link && (
                <a
                  href={currentAnnotation.metadata.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="metadata-link"
                >
                  View Property Details →
                </a>
              )}
            </div>
            <ResponseList
              results={currentAnnotation.responses}
              onFeedbackChange={handleFeedbackChange}
              onError={handleError}
            />
          </div>
        )}
      </div>

      <div className="navigation-wrapper">
        <div className="navigation-controls">
          <button
            className="nav-button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </button>
          <button
            className="nav-button"
            onClick={handleNext}
            disabled={currentIndex === annotations.length - 1}
          >
            Next
          </button>
        </div>
        <div className="prompt-counter">
          {currentIndex + 1} / {annotations.length}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Annotations;
