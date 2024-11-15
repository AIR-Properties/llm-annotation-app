import React from "react";
import { Link } from "react-router-dom";
import "./BackButton.css";

interface BackButtonProps {
  to: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to }) => {
  return (
    <Link to={to} className="back-button">
      ← Back
    </Link>
  );
};

export default BackButton;
