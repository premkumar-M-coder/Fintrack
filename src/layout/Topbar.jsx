import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();              // clear session + user
        navigate("/login", { replace: true }); // force redirect
    }

    return (
        <div
            style={{
                height: 60,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                borderBottom: "1px solid #e5e7eb"
            }}
        >
            <div style={{ fontWeight: 700 }}>
                Welcome Back{user?.username ? `, ${user.username}` : ""}
            </div>

            <button
                onClick={handleLogout}
                style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600
                }}
            >
                Logout
            </button>
        </div>
    );
}
