import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import LLMResponses from "./components/LLMResponses";
import Annotations from "./components/Annotations";
import Arena from "./components/Arena";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/llm-responses"
            element={
              <ProtectedRoute>
                <LLMResponses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/annotations"
            element={
              <ProtectedRoute>
                <Annotations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/arena"
            element={
              <ProtectedRoute>
                <Arena />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
