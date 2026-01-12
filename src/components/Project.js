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
  const [priority, setPriority] = useState(3);
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

  const isProjectMember = () => {
    if (!project || !user) return false;
    if (user.role === "pm") return true;
    return project.teamMembers && project.teamMembers.some(m => m.id === user.id);
  };

  const updateBugStatus = async (bugId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3001/projects/${id}/bugs/${bugId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, userId: user?.id })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed to update status: ${res.status}`);
      }
      const updated = await res.json();
      setBugs(bugs.map(b => b.id === updated.id ? updated : b));
    } catch (err) {
      console.error("Failed to update bug status:", err);
      alert("Failed to update bug status: " + err.message);
    }
  };

  const updateBugSeverity = async (bugId, newSeverity) => {
    try {
      const res = await fetch(`http://localhost:3001/projects/${id}/bugs/${bugId}/severity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity: newSeverity, userId: user?.id })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to update severity');
      }
      const updated = await res.json();
      setBugs(bugs.map(b => b.id === updated.id ? updated : b));
    } catch (err) {
      console.error('Failed to update bug severity:', err);
      alert('Failed to update bug severity: ' + err.message);
    }
  };

  const updateBugPriority = async (bugId, newPriority) => {
    try {
      const res = await fetch(`http://localhost:3001/projects/${id}/bugs/${bugId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority, userId: user?.id })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to update priority');
      }
      const updated = await res.json();
      setBugs(bugs.map(b => b.id === updated.id ? updated : b));
    } catch (err) {
      console.error('Failed to update bug priority:', err);
      alert('Failed to update bug priority: ' + err.message);
    }
  };

  const handleAddBug = async (e) => {
    e.preventDefault();
    if (!newBugDesc.trim()) return;

    const newBug = {
      reporter_id: user.id,
      severity: severity,
      description: newBugDesc,
      status: "OPEN",
      priority: priority,
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
            {bugs.map((bug) => {
              const nextStatus = getNextStatus(bug.status);
              return (
                <li key={bug.id} style={{ background: "#222", padding: "1rem", marginBottom: "1rem", borderRadius: "5px", borderLeft: `5px solid ${getSeverityColor(bug.severity)}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>{bug.description}</p>
                      <small style={{ color: "#888" }}>Status: {bug.status} | </small>
                      {user && user.role === 'tst' && project.testers && project.testers.some(t => t.id === user.id) ? (
                        <>
                          <select value={bug.severity} onChange={(e) => updateBugSeverity(bug.id, e.target.value)} style={{ marginLeft: 6 }}>
                            <option value="LOW">Low</option>
                            <option value="MED">Mid</option>
                            <option value="HIGH">High</option>
                          </select>
                          <select value={bug.priority || 3} onChange={(e) => updateBugPriority(bug.id, Number(e.target.value))} style={{ marginLeft: 6 }}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                          </select>
                        </>
                      ) : (
                        <small style={{ color: "#888" }}>{bug.severity} | P:{bug.priority || 3}</small>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {isProjectMember() && (
                        nextStatus ? (
                          <button
                            className="btn"
                            style={{ background: nextStatus === "IN_PROGRESS" ? "#ff9900" : "#28a745" }}
                            onClick={() => updateBugStatus(bug.id, nextStatus)}
                          >
                            Resolve Bug
                          </button>
                        ) : (
                          <button className="btn" style={{ opacity: 0.6 }} disabled>
                            Resolved
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
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
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ marginRight: "1rem" }}>Priority:</label>
              <select value={priority} onChange={(e) => setPriority(Number(e.target.value))} style={{ padding: '0.5rem' }}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
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

function getNextStatus(current) {
  if (!current) return null;
  const map = {
    "OPEN": "IN_PROGRESS",
    "IN_PROGRESS": "RESOLVED",
    "RESOLVED": null,
    "CLOSED": null
  };
  return map[current] || null;
}

export default Project;