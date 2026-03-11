import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import Dashboard from "../pages/Dashboard/Dashboard";
import Transactions from "../pages/Transactions/Transactions";
import Accounts from "../pages/Accounts/Accounts";
import Budget from "../pages/Budget/Budget";
import Reports from "../pages/Reports/Reports";
import Scheduler from "../pages/Scheduler/Scheduler";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <div style={{ display: "flex" }}>

                {/* Left Sidebar */}
                <Sidebar />

                {/* Main Area */}
                <div style={{ flex: 1, minHeight: "100vh", background: "#f5f7fa" }}>
                    <Topbar />

                    <div style={{ padding: "20px" }}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/accounts" element={<Accounts />} />
                            <Route path="/budget" element={<Budget />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/scheduler" element={<Scheduler />} />
                        </Routes>
                    </div>

                </div>
            </div>
        </BrowserRouter>
    );
}
