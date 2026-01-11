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
          const response = await fetch(`http://localhost:3001/projects/${projectToEdit.id}/bugs`);
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

  const handleSearchUsers = async (e) => {
    const query = e.target.value;
    setUserSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await fetch(`http://localhost:3001/projects/search-users?q=${query}`);
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
        ? `http://localhost:3001/projects/${projectToEdit.id}`
        : "http://localhost:3001/projects";
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
                  <div style={{ fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
                    <span>{bug.title || "Untitled Bug"}</span>
                    <span style={{ fontSize: "0.8em", color: "#ccc" }}>{bug.severity}</span>
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