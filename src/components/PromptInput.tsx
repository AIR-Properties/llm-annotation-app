import React, { useState, useCallback, KeyboardEvent } from "react";
import { ERROR_MESSAGES } from "../constants/messages";
import "./PromptInput.css";

interface PromptInputProps {
  onSubmit: (prompt: string, propertyLink: string) => Promise<void>;
  isLoading: boolean;
  onError: (error: string) => void;
}

type PromptState = string;
type PropertyLinkState = string;

interface PropertyOption {
  title: string;
  url: string;
}

const DEFAULT_PROPERTY_OPTIONS: PropertyOption[] = [
  {
    title: "AIR-29 Boulvard",
    url: "https://www.propertyfinder.ae/en/plp/buy/apartment-for-sale-dubai-downtown-dubai-29-burj-boulevard-29-burj-boulevard-podium-12692673.html",
  },
  {
    title: "AIR-Burj Vista",
    url: "https://www.propertyfinder.ae/en/plp/buy/apartment-for-sale-dubai-downtown-dubai-burj-vista-burj-vista-1-12930246.html",
  },
  {
    title: "Others-Marina Gate 1",
    url: "https://www.propertyfinder.ae/en/plp/buy/apartment-for-sale-dubai-dubai-marina-marina-gate-marina-gate-1-12764778.html",
  },
];

const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading,
  onError,
}) => {
  const [prompt, setPrompt] = useState<PromptState>("");
  const [propertyLink, setPropertyLink] = useState<PropertyLinkState>(
    DEFAULT_PROPERTY_OPTIONS[0].url
  );
  const [isCustomLink, setIsCustomLink] = useState(false);

  const handlePaste = useCallback(async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      setPropertyLink(text);
      setIsCustomLink(true);
    } catch (err) {
      console.error("Failed to read clipboard contents:", err);
      onError(ERROR_MESSAGES.CLIPBOARD_ERROR);
    }
  }, [onError]);

  const handlePasteToPrompt = useCallback(async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      setPrompt(text);
    } catch (err) {
      console.error("Failed to read clipboard contents:", err);
      onError(ERROR_MESSAGES.CLIPBOARD_ERROR);
    }
  }, [onError]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!prompt.trim()) return;
    await onSubmit(prompt.trim(), propertyLink.trim());
  }, [prompt, propertyLink, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setPrompt(e.target.value);
    },
    []
  );

  const handlePropertyLinkChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const value = e.target.value;
      if (e.target.tagName.toLowerCase() === "select") {
        if (value === "custom") {
          setIsCustomLink(true);
          setPropertyLink("");
        } else {
          setIsCustomLink(false);
          setPropertyLink(value);
        }
      } else {
        setPropertyLink(value);
      }
    },
    []
  );

  const getCurrentPropertyOption = () => {
    if (isCustomLink) return null;
    return DEFAULT_PROPERTY_OPTIONS.find(
      (option) => option.url === propertyLink
    );
  };

  return (
    <div className="input-section">
      <div className="input-group">
        <label className="input-label" htmlFor="prompt">
          Ask Question
        </label>
        <div className="input-row">
          <textarea
            id="prompt"
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question about the property (property link is below)..."
          />
          <button
            className="paste-button"
            onClick={handlePasteToPrompt}
            title="Paste to prompt"
          >
            📋
          </button>
        </div>
      </div>
      <div className="input-group">
        <label className="input-label" htmlFor="property-link">
          Property Link
        </label>
        <div className="input-row property-input-row">
          <select
            value={isCustomLink ? "custom" : propertyLink}
            onChange={handlePropertyLinkChange}
            className="property-select"
          >
            {DEFAULT_PROPERTY_OPTIONS.map((option) => (
              <option key={option.url} value={option.url}>
                {option.title}
              </option>
            ))}
            <option value="custom">Custom Link</option>
          </select>
          {!isCustomLink && propertyLink && (
            <a
              href={propertyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="property-link"
            >
              {propertyLink}
            </a>
          )}
          {isCustomLink && (
            <div className="custom-link-input">
              <input
                type="text"
                id="property-link"
                value={propertyLink}
                onChange={handlePropertyLinkChange}
                placeholder="Enter property URL..."
              />
              <button className="paste-button" onClick={handlePaste}>
                Paste
              </button>
            </div>
          )}
        </div>
        <button
          className={`send-button ${isLoading ? "loading" : ""}`}
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? <span className="loading-spinner">↻</span> : "Send"}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;
