import React, { useState } from "react";
import ChangePassword from "./ChangePassword";
import Help from "./Help";
import About from "./About";
import BackupRestore from "./BackupRestore";
import ResetData from "./ResetData";

export default function Settings() {
    const [tab, setTab] = useState("security");

    return (
        <div style={{ padding: 20, maxWidth: 900 }}>
            <h2>Settings</h2>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button onClick={() => setTab("security")}>Security</button>
                <button onClick={() => setTab("backup")}>Backup</button>
                <button onClick={() => setTab("help")}>Help</button>
                <button onClick={() => setTab("about")}>About</button>
                <button
                    onClick={() => setTab("reset")}
                    style={{ color: "#ef4444" }}
                >
                    Reset
                </button>
            </div>

            {tab === "security" && <ChangePassword />}
            {tab === "backup" && <BackupRestore />}
            {tab === "help" && <Help />}
            {tab === "about" && <About />}
            {tab === "reset" && <ResetData />}
        </div>
    );
}
