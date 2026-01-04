import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`http://localhost:3001/projects?userId=${user.id}`);
        const data = await response.json();
        setProjects(data);
      } catch(err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user.id]);

  const handleDelete = (id) => {
    // frontend-only delete for now
    setProjects(projects.filter((p) => p.id !== id));
  };

  if(loading) {
    return <p style={{textAlign: "center", padding: "2rem"}}>Loading Projects...</p>;
  }

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
      </form>

      <div className="main-content">
        {projects.length === 0 ? (<p>You are not part of any project yet.</p>) : 
          (
            <ul style={{listStyle: "none", padding: 0}}>
              {
                projects.map((proj) => (
                  <li key={proj.id} style={{marginBottom: "1rem"}}>
                    <div className="project-row">
                      <div className="project-info">
                        <span className="project-name">{proj.name}</span>
                        <span className="project-desc">{proj.description}</span>
                      </div>
                      <button
                        className="btn"
                        style={{ marginLeft: "1rem", background: "#444" }}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent triggering proj click
                          handleDelete(proj.id);
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  </li>
                ))
              }
            </ul>
          )
        }
      </div>
    </div>
  );
}

export default Dashboard;
