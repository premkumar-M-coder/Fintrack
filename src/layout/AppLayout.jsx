// src/layout/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    background: "#f5f7fa"
                }}
            >
                {/* Topbar */}
                <Topbar />

                {/* Routed Pages */}
                <main style={{ padding: 20, flex: 1 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
