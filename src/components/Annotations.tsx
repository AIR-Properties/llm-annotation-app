import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ResponseBox from './ResponseBox';
import Toast from './Toast';
import Footer from './Footer';
import { annotationService, APIError } from '../services/api';
import { mapAnnotationsToDomain } from '../utils/mappers';
import { ERROR_MESSAGES } from '../constants/messages';
import { Response as DomainResponse } from '../types/domain';
import { SAMPLE_ANNOTATIONS } from '../data/sampleData';
import { getUserName } from '../utils/auth';
import './Annotations.css';

interface AnnotationResponse extends DomainResponse {
  feedback?: 'helpful' | 'not_helpful';
}

interface AnnotationBox {
  id: string;
  title: string;
  responses: AnnotationResponse[];
  isExpanded: boolean;
  isClosing?: boolean;
}

const Annotations: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationBox[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const username = getUserName();
        if (!username) {
          setError('User not authenticated');
          return;
        }

        const response = await annotationService.getAnnotations({ username });
        const mappedData = mapAnnotationsToDomain(response);
        setAnnotations(mappedData.map(item => ({
          ...item,
          isExpanded: true,
          responses: item.responses
        })));
      } catch (err) {
        console.error('Error fetching annotations:', err);
        if (err instanceof APIError) {
          setError(ERROR_MESSAGES.REQUEST_FAILED(err.message));
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(ERROR_MESSAGES.UNEXPECTED_ERROR);
        }
        // Keep showing sample data on error
        setAnnotations(mapAnnotationsToDomain(SAMPLE_ANNOTATIONS).map(item => ({
          ...item,
          isExpanded: true,
          responses: item.responses
        })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnotations();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < annotations.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, annotations.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // minimum swipe distance
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  const handleFeedbackChange = useCallback((annotationId: string, responseId: string, newFeedback: 'helpful' | 'not_helpful' | undefined) => {
    setAnnotations(prevAnnotations => {
      const newAnnotations = prevAnnotations.map(annotation =>
        annotation.id === annotationId
          ? {
              ...annotation,
              responses: annotation.responses.map(response =>
                response.id === responseId
                  ? { ...response, feedback: newFeedback }
                  : response
              )
            }
          : annotation
      );

      return newAnnotations;
    });
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  if (isLoading) {
    return <div className="annotations-container loading">Loading...</div>;
  }

  return (
    <div 
      className="annotations-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {error && (
        <Toast 
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      <Link to="/" className="back-button">← Back</Link>
      
      <div className="content-wrapper">
        <div 
          className="annotation-boxes"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {annotations.map((annotation, index) => (
            <div key={annotation.id} className="annotation-box">
              <div className="prompt-title">
                {annotation.title}
              </div>
              <div className="responses-section">
                {annotation.responses.map(response => (
                  <ResponseBox
                    key={response.id}
                    title={response.title}
                    text={response.text}
                    feedback={response.feedback}
                    prompt_id={annotation.id}
                    response_id={response.id}
                    onFeedbackChange={(feedback) => handleFeedbackChange(annotation.id, response.id, feedback)}
                    onError={handleError}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
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

      {showSwipeHint && (
        <div className="swipe-hint">
          Swipe left or right to navigate between prompts
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Annotations;
