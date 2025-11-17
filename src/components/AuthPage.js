import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

const handleRegister = async (e) => {
    e.preventDefault(); 

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const response = await fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: { "Content-Type" : "application/json"},
      body: JSON.stringify({email, password, name})
    });
    console.log("test");
    const data = await response.json();

    if(response.ok) {
      alert("Registered successfully!");
      navigate("/dashboard");
    } else {
      alert("Registration failed: " + data.error);
    }
};

  return (
    <div className="auth-container">
      <h1 className="app-title">🐞 Number 1 Debugger</h1>

      <div className="tab-switch">
        <button
          id="loginTab"
          className={activeTab === "login" ? "active" : ""}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
        <button
          id="registerTab"
          className={activeTab === "register" ? "active" : ""}
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
      </div>

      {/* LOGIN FORM */}
      {activeTab === "login" && (
        <form id="loginForm" className="auth-form active" onSubmit={handleLogin}>
          <input type="email" id="loginEmail" placeholder="Email" required />
          <input
            type="password"
            id="loginPassword"
            placeholder="Password"
            required
          />
          <button type="submit" className="btn">
            Login
          </button>
        </form>
      )}

      {/* REGISTER FORM */}
      {activeTab === "register" && (
        <form
          id="registerForm"
          className="auth-form active"
          onSubmit={handleRegister}
        >
          <input type="text" id="registerName" placeholder="Full Name" required />
          <input type="email" id="registerEmail" placeholder="Email" required />
          <input
            type="password"
            id="registerPassword"
            placeholder="Password"
            required
          />

          <div className="role-select">
            <label htmlFor="role">Register as:</label>
            <select id="role" required>
              <option value="pm">Project Member (PM)</option>
              <option value="tst">Tester (TST)</option>
            </select>
          </div>

          <button type="submit" className="btn" id="btnRegister">
            Register
          </button>
        </form>
      )}
    </div>
  );
}

export default AuthPage;
