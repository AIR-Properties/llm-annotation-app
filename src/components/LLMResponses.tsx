import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Toast from './Toast';
import Footer from './Footer';
import PromptInput from './PromptInput';
import ResponseList from './ResponseList';
import { annotationService, APIError } from '../services/api';
import { mapAskResponseToDomain } from '../utils/mappers';
import { getUserName } from '../utils/auth';
import { 
    ErrorState, 
    LoadingState, 
    ResultsState, 
    FeedbackType,
    Response as DomainResponse 
} from '../types/domain';
import { SAMPLE_RESULTS } from '../data/sampleData';
import { ERROR_MESSAGES } from '../constants/messages';
import './LLMResponses.css';

const LLMResponses: React.FC = () => {
  const [isLoading, setIsLoading] = useState<LoadingState>(false);
  const [error, setError] = useState<ErrorState>(null);
  const [results, setResults] = useState<ResultsState>(SAMPLE_RESULTS);

  const handleSubmit = useCallback(async (prompt: string, propertyLink: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const username = getUserName();
      if (!username) {
        setError('User not authenticated');
        return;
      }

      const response = await annotationService.ask({
        prompt,
        propertyLink: propertyLink || undefined,
        username
      });
      
      const domainResponses: DomainResponse[] = mapAskResponseToDomain(response);
      const newResults: ResultsState = domainResponses;

      setResults(newResults);
    } catch (err) {
      console.error('Error sending prompt:', err);
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
  }, []);

  const handleFeedbackChange = useCallback((resultId: string, feedback: FeedbackType | undefined): void => {
    setResults(prevResults => 
      prevResults.map(result => 
        result.id === resultId 
          ? { ...result, feedback }
          : result
      )
    );
  }, []);

  const handleError = useCallback((errorMessage: string): void => {
    setError(errorMessage);
  }, []);

  const handleClearError = useCallback((): void => {
    setError(null);
  }, []);

  return (
    <div className="llm-responses-container">
      {error && (
        <Toast 
          message={error}
          type="error"
          onClose={handleClearError}
        />
      )}
      <Link to="/" className="back-button">← Back</Link>
      
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

      <Footer />
    </div>
  );
};

export default LLMResponses;
