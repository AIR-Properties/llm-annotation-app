import React from "react";
import "./Toast.css";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = "error", onClose }) => {
  return (
    <div className={`toast ${type}`}>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
