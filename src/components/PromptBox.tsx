import React from "react";
import { Metadata } from "../types/api";
import "./PromptBox.css";

interface PromptBoxProps {
  prompt: string;
  metadata?: Metadata;
}

const PromptBox: React.FC<PromptBoxProps> = ({ prompt, metadata }) => {
  return (
    <div className="prompt-section">
      <div className="prompt-title">{prompt}</div>
      {metadata?.title && (
        <div className="metadata-title">{metadata.title}</div>
      )}
      {metadata?.link && (
        <a
          href={metadata.link}
          target="_blank"
          rel="noopener noreferrer"
          className="metadata-link"
        >
          View Property Details →
        </a>
      )}
    </div>
  );
};

export default PromptBox;
