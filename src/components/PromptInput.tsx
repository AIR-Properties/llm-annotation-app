import React, { useState, useCallback, KeyboardEvent } from "react";
import { ERROR_MESSAGES } from "../constants/messages";

interface PromptInputProps {
  onSubmit: (prompt: string, propertyLink: string) => Promise<void>;
  isLoading: boolean;
  onError: (error: string) => void;
}

type PromptState = string;
type PropertyLinkState = string;

const DEFAULT_PROPERTY_LINK =
  "https://www.propertyfinder.ae/en/plp/buy/apartment-for-sale-dubai-downtown-dubai-29-burj-boulevard-29-burj-boulevard-podium-12692673.html";

const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading,
  onError,
}) => {
  const [prompt, setPrompt] = useState<PromptState>("");
  const [propertyLink, setPropertyLink] = useState<PropertyLinkState>(
    DEFAULT_PROPERTY_LINK
  );

  const handlePaste = useCallback(async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      setPropertyLink(text);
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
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setPropertyLink(e.target.value);
    },
    []
  );

  const handleClearPropertyLink = useCallback((): void => {
    setPropertyLink("");
  }, []);

  return (
    <div className="input-section">
      <div className="input-group">
        <label className="input-label" htmlFor="prompt">
          Prompt
        </label>
        <div className="input-row">
          <textarea
            id="prompt"
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt here..."
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
        <div className="input-row">
          <input
            type="text"
            id="property-link"
            value={propertyLink}
            onChange={handlePropertyLinkChange}
          />
          <button className="remove-button" onClick={handleClearPropertyLink}>
            Remove
          </button>
          <button className="paste-button" onClick={handlePaste}>
            Paste
          </button>
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
