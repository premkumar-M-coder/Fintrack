// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layout/AppLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Accounts from "./pages/Accounts/Accounts";
import Transactions from "./pages/Transactions/Transactions";
import Budget from "./pages/Budget/Budget";
import Reports from "./pages/Reports/Reports";
import Scheduler from "./pages/Scheduler/Scheduler";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import { useAuth } from "./context/AuthContext";

/* ================= PROTECTED ROUTE ================= */
function ProtectedRoute({ children }) {
    const { user, ready } = useAuth();

    if (!ready) return null;
    if (!user) return <Navigate to="/login" replace />;

    return children;
}

/* ================= APP ================= */
export default function App() {
    return (
        <Routes>
            {/* -------- PUBLIC ROUTES -------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* -------- PROTECTED ROUTES -------- */}
            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/scheduler" element={<Scheduler />} />
                <Route path="/settings" element={<Settings />} />
            </Route>

            {/* -------- SAFE FALLBACK -------- */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
