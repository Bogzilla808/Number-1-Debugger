import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AuthPage from "./components/AuthPage.js";
import Dashboard from "./components/Dashboard.js";
import CreateProjectForm from "./components/CreateProjectForm.js";
import Header from "./components/Header.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import "./App.css";
import { useAuth } from "./context/AuthContext.js";

function AppWrapper() {
  const location = useLocation();
  const {user} = useAuth();
  const showHeader = user && location.pathname !== "/";

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/" element={<AuthPage />} />

        {/* PROTECTED ROUTES */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-project" element={<ProtectedRoute><CreateProjectForm /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;