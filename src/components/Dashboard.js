import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(["Proiect1", "Proiect2"]);

  const handleDelete = (name) => {
    setProjects(projects.filter((p) => p !== name));
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <form>
        <button
          className="btn"
          type="button"
          onClick={() => navigate("/create-project")}
        >
          Create project
        </button>
        <button className="btn" type="button">
          Edit project
        </button>
      </form>

      <div className="main-content">
        <ul>
          {projects.map((proj, i) => (
            <li key={i}>
              {proj}
              <button
                className="btn"
                style={{ marginLeft: "1rem", background: "#444" }}
                onClick={() => handleDelete(proj)}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
