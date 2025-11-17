import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage.js";
import Dashboard from "./components/Dashboard.js";
import CreateProjectForm from "./components/CreateProjectForm.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-project" element={<CreateProjectForm />} />
      </Routes>
    </Router>
  );
}

export default App;