import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null; // no header if not logged in

  return (
    <header className="header">
      {/* BUG LOGO BUTTON */}
      <button
        className="logo-btn"
        onClick={() => navigate("/dashboard")}
      >
        🐞
      </button>

      {/* User info + dropdown */}
      <div className="user-info"
        style={{position: "relative", display: "inline-block"}}
      >
        <span
          style={{ cursor: "pointer" }}
          onClick={() => setOpen(!open)}
        >
          {user.name} ({user.role}) ▼
        </span>

        {open && (
          <div className="account-dropdown"
            style={{
                position: "absolute",
                top: "100%", // directly below the span
                right: 0,
                background: "#333",
                padding: "10px",
                borderRadius: "5px",
                zIndex: 1000, // make sure it’s on top
            }}
          >
            <button
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                cursor: "pointer",
              }}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
