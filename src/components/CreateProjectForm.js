import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CreateProjectForm() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const projectToEdit = location.state?.project;
  const [bugs, setBugs] = useState([]);
  const [expandedBugId, setExpandedBugId] = useState(null);
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [testers, setTesters] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);

  useEffect(() => {
    if (projectToEdit) {
      setProjectName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setRepoUrl(projectToEdit.repo_url || "");

      setTeamMembers(projectToEdit.teamMembers || []);
      setTesters(projectToEdit.testers || []);

      const fetchBugs = async () => {
        try {
          const response = await fetch(`https://number-1-debugger-api.onrender.com/projects/${projectToEdit.id}/bugs`);
          if (response.ok) {
            const data = await response.json();
            setBugs(data);
          }
        } catch (err) {
          console.error("Error fetching bugs:", err);
        }
      };
      fetchBugs();
    }
  }, [projectToEdit]);

  const getNextStatus = (current) => {
    if (!current) return null;
    const map = { OPEN: 'IN_PROGRESS', IN_PROGRESS: 'RESOLVED', RESOLVED: null, CLOSED: null };
    return map[current] || null;
  };

  const updateBugStatus = async (bugId) => {
    const next = getNextStatus(bugs.find(b => b.id === bugId)?.status);
    if (!next) return;
    try {
      const res = await fetch(`https://number-1-debugger-api.onrender.com/projects/${projectToEdit.id}/bugs/${bugId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next, userId: user?.id })
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setBugs(bugs.map(b => b.id === updated.id ? updated : b));
    } catch (err) {
      console.error('Error updating bug status:', err);
      alert('Error updating bug status: ' + err.message);
    }
  };

  const updateBugSeverity = async (bugId, newSeverity) => {
    try {
      const res = await fetch(`https://number-1-debugger-api.onrender.com/projects/${projectToEdit.id}/bugs/${bugId}/severity`, {
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
      console.error('Error updating bug severity:', err);
      alert('Error updating bug severity: ' + err.message);
    }
  };

  const updateBugPriority = async (bugId, newPriority) => {
    try {
      const res = await fetch(`https://number-1-debugger-api.onrender.com/projects/${projectToEdit.id}/bugs/${bugId}/priority`, {
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
      console.error('Error updating bug priority:', err);
      alert('Error updating bug priority: ' + err.message);
    }
  };

  const handleSearchUsers = async (e) => {
    const query = e.target.value;
    setUserSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await fetch(`https://number-1-debugger-api.onrender.com/projects/search-users?q=${query}`);
        const data = await res.json();
        setUserSearchResults(data);
      } catch (err) {
        console.error("Search error", err);
      }
    } else {
      setUserSearchResults([]);
    }
  };

  const addUser = (user) => {
    if (user.role === 'pm') {
      if (!teamMembers.find(m => m.id === user.id)) setTeamMembers([...teamMembers, user]);
    } else if (user.role === 'tst') {
      if (!testers.find(t => t.id === user.id)) setTesters([...testers, user]);
    }
    setUserSearchQuery("");
    setUserSearchResults([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const url = projectToEdit 
        ? `https://number-1-debugger-api.onrender.com/projects/${projectToEdit.id}`
        : "https://number-1-debugger-api.onrender.com/projects";
      const method = projectToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description,
          repo_url: repoUrl,
          created_by_user_id: user.id,
          teamMemberIds: teamMembers.map(u => u.id),
          testerIds: testers.map(u => u.id)
        })
      });

      if (response.ok) {
        navigate("/dashboard");
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          alert(`Failed to ${projectToEdit ? "update" : "create"} project: ` + data.error);
        } else {
          const text = await response.text();
          console.error("Server error response:", text);
          alert(`Failed to ${projectToEdit ? "update" : "create"} project: Server returned ${response.status} ${response.statusText}`);
        }
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ flex: 1 }}>
        <form onSubmit={handleSave} className="projectForm">
          <div className="projectContainer" style={{ padding: "2rem" }}>
            <label htmlFor="projectName">Project name:</label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              disabled={user.role === "tst"}
            />
            <hr />

            <label htmlFor="description">Description:</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={user.role === "tst"}
            />
            <hr />

            <label htmlFor="repoUrl">Repo URL:</label>
            <input
              type="text"
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              disabled={user.role === "tst"}
            />
            <hr />

            {user.role === "pm" && (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <label>Add Members / Testers:</label>
                  <input 
                    type="text" 
                    placeholder="Search user by name..." 
                    value={userSearchQuery}
                    onChange={handleSearchUsers}
                  />
                  {userSearchResults.length > 0 && (
                    <ul style={{ background: "#444", listStyle: "none", padding: "0.5rem", marginTop: "0.5rem", borderRadius: "4px" }}>
                      {userSearchResults.map(u => (
                        <li 
                          key={u.id} 
                          onClick={() => addUser(u)}
                          style={{ cursor: "pointer", padding: "0.25rem", borderBottom: "1px solid #555" }}
                        >
                          {u.name} ({u.role})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <h4>Team Members:</h4>
                  <ul style={{ paddingLeft: "1.5rem" }}>
                    {teamMembers.map(m => (
                      <li key={m.id}>
                        {m.name} 
                        <button type="button" onClick={() => setTeamMembers(teamMembers.filter(tm => tm.id !== m.id))} style={{ marginLeft: "1rem", color: "red", background: "none", border: "none", cursor: "pointer" }}>x</button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <h4>Testers:</h4>
                  <ul style={{ paddingLeft: "1.5rem" }}>
                    {testers.map(t => (
                      <li key={t.id}>
                        {t.name}
                        <button type="button" onClick={() => setTesters(testers.filter(tt => tt.id !== t.id))} style={{ marginLeft: "1rem", color: "red", background: "none", border: "none", cursor: "pointer" }}>x</button>
                      </li>
                    ))}
                  </ul>
                </div>
                <hr />
              </>
            )}

            {user.role === "pm" && (
              <button type="submit" className="btn">
                {projectToEdit ? "Update Project" : "Save Project"}
              </button>
            )}
          </div>
        </form>
      </div>

      {projectToEdit && (
        <div style={{ flex: 1, background: "#333", padding: "1rem", borderRadius: "8px", height: "fit-content", color: "#fff" }}>
          <h3>Project Bugs</h3>
          {bugs.length === 0 ? (
            <p>No bugs found for this project.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {bugs.map((bug) => (
                <li
                  key={bug.id}
                  style={{ marginBottom: "0.5rem", background: "#444", padding: "0.5rem", borderRadius: "4px", cursor: "pointer" }}
                  onClick={() => setExpandedBugId(expandedBugId === bug.id ? null : bug.id)}
                >
                    <div style={{ fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span>{bug.title || "Untitled Bug"}</span>
                      {user && user.role === 'tst' && projectToEdit && projectToEdit.testers && projectToEdit.testers.some(t => t.id === user.id) ? (
                        <>
                          <select value={bug.severity} onChange={(e) => { e.stopPropagation(); updateBugSeverity(bug.id, e.target.value); }}>
                            <option value="LOW">Low</option>
                            <option value="MED">Mid</option>
                            <option value="HIGH">High</option>
                          </select>
                          <select value={bug.priority || 3} onChange={(e) => { e.stopPropagation(); updateBugPriority(bug.id, Number(e.target.value)); }} style={{ marginLeft: 6 }}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                          </select>
                        </>
                      ) : (
                        <span style={{ fontSize: "0.8em", color: "#ccc" }}>{bug.severity} | P:{bug.priority || 3}</span>
                      )}
                    </div>
                    <div>
                      {user && user.role === 'pm' && (() => {
                        const next = getNextStatus(bug.status);
                        // If IN_PROGRESS, only the assigned_to user can advance to RESOLVED
                        const locked = bug.status === 'IN_PROGRESS' && bug.assigned_to && bug.assigned_to !== user.id;
                        return next ? (
                          <button
                            className="btn"
                            style={{ background: next === 'IN_PROGRESS' ? '#ff9900' : '#28a745' }}
                            onClick={(e) => { e.stopPropagation(); updateBugStatus(bug.id); }}
                            disabled={locked}
                            title={locked ? 'Only assigned member can resolve this bug' : ''}
                          >
                            Resolve Bug
                          </button>
                        ) : (
                          <button className="btn" style={{ opacity: 0.6 }} disabled>Resolved</button>
                        );
                      })()}
                    </div>
                  </div>
                  {expandedBugId === bug.id && (
                    <div style={{ marginTop: "0.5rem", borderTop: "1px solid #555", paddingTop: "0.5rem" }}>
                      <p style={{ margin: "0 0 0.5rem 0" }}>{bug.description}</p>
                      <small style={{ color: "#aaa" }}>Status: {bug.status}</small>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateProjectForm;