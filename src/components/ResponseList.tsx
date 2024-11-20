import React, { useCallback } from "react";
import ResponseBox from "./ResponseBox";
import { ResponseListProps } from "../types/components";
import { FeedbackType } from "../types/domain";
import "./ResponseList.css";

const ResponseList: React.FC<ResponseListProps> = ({
  results,
  onFeedbackChange,
  onError,
  className,
}) => {
  const handleFeedback = useCallback(
    (resultId: string, feedback: FeedbackType | undefined): void => {
      onFeedbackChange?.(resultId, feedback);
    },
    [onFeedbackChange]
  );

  return (
    <div className={`responses-section ${className || ""}`}>
      {results.map((result) => (
        <ResponseBox
          key={result.id}
          title={result.title}
          text={result.text}
          feedback={result.feedback}
          prompt_id={result.prompt_id}
          answer_id={result.id}
          onFeedbackChange={
            onFeedbackChange
              ? (feedback) => handleFeedback(result.id, feedback)
              : undefined
          }
          onError={onError}
        />
      ))}
    </div>
  );
};

export default ResponseList;
