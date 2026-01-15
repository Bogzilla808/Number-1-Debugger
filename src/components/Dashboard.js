import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBugProject, setActiveBugProject] = useState(null);
  const [bugDescription, setBugDescription] = useState("");
  const [bugTitle, setBugTitle] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`https://number-1-debugger-api.onrender.com/projects?userId=${user.id}`);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`https://number-1-debugger-api.onrender.com/projects/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete project.");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Error deleting project");
    }
  };

  const handleAddBugClick = (e, projectId) => {
    e.stopPropagation();
    if (activeBugProject === projectId) {
      setActiveBugProject(null);
      setBugDescription("");
      setBugTitle("");
    } else {
      setActiveBugProject(projectId);
      setBugDescription("");
      setBugTitle("");
    }
  };

  const handleSaveBug = async (e, projectId) => {
    e.stopPropagation();
    if (!bugDescription.trim() || !bugTitle.trim()) return;

    try {
      const response = await fetch(`https://number-1-debugger-api.onrender.com/projects/${projectId}/bugs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter_id: user.id,
          severity: "LOW",
          title: bugTitle,
          description: bugDescription,
          status: "OPEN",
          created_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert("Bug added successfully!");
        setActiveBugProject(null);
        setBugDescription("");
        setBugTitle("");
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          alert("Failed to add bug: " + data.error);
        } else {
          const text = await response.text();
          alert("Failed to add bug: Server returned " + response.status + " " + response.statusText);
          console.error("Server error:", text);
        }
      }
    } catch (err) {
      console.error("Error adding bug:", err);
      alert("Error adding bug: " + err.message);
    }
  };

  if(loading) {
    return <p style={{textAlign: "center", padding: "2rem"}}>Loading Projects...</p>;
  }

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      {user.role === "pm" && (
        <form>
          <button
            className="btn"
            type="button"
            onClick={() => navigate("/create-project")}
          >
            Create project
          </button>
        </form>
      )}

      <div className="main-content">
        {projects.length === 0 ? (<p>You are not part of any project yet.</p>) : 
          (
            <ul style={{listStyle: "none", padding: 0}}>
              {
                projects.map((proj) => (
                  <li key={proj.id} style={{marginBottom: "1rem"}}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div 
                        className="project-row" 
                        onClick={() => navigate("/create-project", { state: { project: proj } })}
                        style={{ cursor: "pointer", flex: 1 }}
                      >
                        <div className="project-info">
                          <span className="project-name">{proj.name}</span>
                          <span className="project-desc">{proj.description}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {user.role === "tst" && proj.testers && proj.testers.some(t => t.id === user.id) && (
                          <button
                            className="btn"
                            style={{ background: "#28a745" }}
                            onClick={(e) => handleAddBugClick(e, proj.id)}
                          >
                            Add Bug
                          </button>
                        )}
                        {user.role === "pm" && (
                          <button
                            className="btn"
                            style={{ background: "#444" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(proj.id);
                            }}
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>
                    {activeBugProject === proj.id && user.role === "tst" && (
                      <div style={{ marginTop: "1rem", padding: "1rem", background: "#333", borderRadius: "5px" }} onClick={(e) => e.stopPropagation()}>
                        <h4>Report Bug for {proj.name}</h4>
                        <input
                          type="text"
                          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
                          placeholder="Bug Title"
                          value={bugTitle}
                          onChange={(e) => setBugTitle(e.target.value)}
                        />
                        <textarea
                          style={{ width: "100%", minHeight: "80px", padding: "0.5rem", margin: "0.5rem 0" }}
                          placeholder="Describe the bug..."
                          value={bugDescription}
                          onChange={(e) => setBugDescription(e.target.value)}
                        />
                        <button className="btn" onClick={(e) => handleSaveBug(e, proj.id)}>
                          Save Bug
                        </button>
                      </div>
                    )}
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
