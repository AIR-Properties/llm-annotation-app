import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Toast from "./Toast";
import "./Home.css";

const Home: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const handleNavigate = (path: string) => {
    if (!validateName(userName)) {
      setError("Please enter a valid name (at least 2 characters)");
      return;
    }
    localStorage.setItem("userName", userName.trim());
    navigate(path);
  };

  return (
    <div className="home-container">
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
      <div className="content">
        <h1>Welcome to Airnotation</h1>
        <img
          src="/logo.png"
          alt="AIR Logo"
          className={`air-logo ${isLoaded ? "loaded" : ""}`}
          onLoad={() => setIsLoaded(true)}
        />
        <div className="description-box">
          <i className="info-icon">i</i>
          <p className="description">
            You can review Advisory capability of AIR, and compare quality of
            answers to mainstream LLMs, by either asking your own questions or
            reviewing examples.
          </p>
        </div>
        <div className="name-input-container">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="name-input"
            aria-label="Your name"
          />
        </div>
        <div className="links">
          <button
            className="nav-button"
            onClick={() => handleNavigate("/llm-responses")}
          >
            Ask Questions 
          </button>
          <button
            className="nav-button"
            onClick={() => handleNavigate("/annotations")}
          >
            Review and Annotate
          </button>
          <button
            className="nav-button"
            onClick={() => handleNavigate("/arena")}
          >
            Arena
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
