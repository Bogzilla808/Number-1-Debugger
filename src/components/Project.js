import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [newBugDesc, setNewBugDesc] = useState("");
  const [severity, setSeverity] = useState("LOW");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projResponse = await fetch(`http://localhost:3001/projects/${id}`);
        if (!projResponse.ok) {
          throw new Error("Project not found");
        }
        const projData = await projResponse.json();
        setProject(projData);

        // Fetch bugs for this project
        const bugsResponse = await fetch(`http://localhost:3001/projects/${id}/bugs`);
        if (bugsResponse.ok) {
          const bugsData = await bugsResponse.json();
          setBugs(bugsData);
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        alert("Could not load project data.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
    }
  }, [id, navigate]);

  const handleAddBug = async (e) => {
    e.preventDefault();
    if (!newBugDesc.trim()) return;

    const newBug = {
      reporter_id: user.id,
      severity: severity,
      description: newBugDesc,
      status: "OPEN",
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`http://localhost:3001/projects/${id}/bugs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBug)
      });

      if (response.ok) {
        const savedBug = await response.json();
        setBugs([...bugs, savedBug]);
        setNewBugDesc("");
      } else {
        alert("Failed to add bug.");
      }
    } catch (err) {
      console.error("Error adding bug:", err);
      alert("Error adding bug: " + err.message);
    }
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading Project...</div>;
  if (!project) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <button className="btn" onClick={() => navigate("/dashboard")} style={{ marginBottom: "1rem" }}>
        &larr; Back to Dashboard
      </button>
      
      <div className="project-header" style={{ marginBottom: "2rem" }}>
        <h1>{project.name}</h1>
        <p style={{ fontSize: "1.1rem", color: "#ccc" }}>{project.description}</p>
        {project.repo_url && (
          <p>
            <strong>Repo:</strong> <a href={project.repo_url} target="_blank" rel="noreferrer" style={{ color: "#4da6ff" }}>{project.repo_url}</a>
          </p>
        )}
      </div>

      <hr style={{ borderColor: "#444" }} />

      <div className="bugs-section">
        <h2>Bugs</h2>
        {bugs.length === 0 ? (
          <p>No bugs reported yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {bugs.map((bug) => (
              <li key={bug.id} style={{ background: "#222", padding: "1rem", marginBottom: "1rem", borderRadius: "5px", borderLeft: `5px solid ${getSeverityColor(bug.severity)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>{bug.description}</p>
                    <small style={{ color: "#888" }}>Status: {bug.status} | Severity: {bug.severity}</small>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {user.role === "tst" && project.testers && project.testers.some(t => t.id === user.id) && (
        <div className="add-bug-form" style={{ marginTop: "2rem", background: "#333", padding: "1.5rem", borderRadius: "8px" }}>
          <h3>Report a Bug</h3>
          <form onSubmit={handleAddBug}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Description:</label>
              <textarea
                value={newBugDesc}
                onChange={(e) => setNewBugDesc(e.target.value)}
                required
                style={{ width: "100%", minHeight: "80px", padding: "0.5rem" }}
                placeholder="Describe the issue..."
              />
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ marginRight: "1rem" }}>Severity:</label>
              <select 
                value={severity} 
                onChange={(e) => setSeverity(e.target.value)}
                style={{ padding: "0.5rem" }}
              >
                <option value="LOW">Low</option>
                <option value="MED">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <button type="submit" className="btn">Add Bug</button>
          </form>
        </div>
      )}
    </div>
  );
}

function getSeverityColor(severity) {
  switch (severity) {
    case "CRITICAL": return "#ff4444";
    case "HIGH": return "#ffbb33";
    case "MED": return "#00C851";
    default: return "#33b5e5";
  }
}

export default Project;