import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage.js";
import Dashboard from "./components/Dashboard.js";
import CreateProjectForm from "./components/CreateProjectForm.js";
import Header from "./components/Header.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        // PUBLIC ROUTE
        <Route path="/" element={<AuthPage />} />

        // PROTECTED ROUTES
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-project" element={<ProtectedRoute><CreateProjectForm /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;