import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Project from "./Projects.js";

function CreateProjectForm() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const navigate = useNavigate();

  const handleSave = (e) => {
    e.preventDefault();
    Project.addProject(projectName, description, repoUrl);
    navigate("/dashboard");
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
