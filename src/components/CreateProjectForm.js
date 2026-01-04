import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CreateProjectForm() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:3001/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description,
          repo_url: repoUrl,
          created_by_user_id: user.id
        })
      });

      if (response.ok) {
        navigate("/dashboard");
      } else {
        const data = await response.json();
        alert("Failed to create project: " + data.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSave} className="projectForm">
      <div className="projectContainer" style={{ padding: "2rem" }}>
        <label htmlFor="projectName">Project name:</label>
        <input
          type="text"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
        <hr />

        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <hr />

        <label htmlFor="repoUrl">Repo URL:</label>
        <input
          type="text"
          id="repoUrl"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          required
        />
        <hr />

        <button type="submit" className="btn">
          Save Project
        </button>
      </div>
    </form>
  );
}

export default CreateProjectForm;