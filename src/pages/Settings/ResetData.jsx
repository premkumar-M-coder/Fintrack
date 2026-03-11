import React, { useState } from "react";
import { softResetUserData, resetUserData } from "../../services/db";
import { useAuth } from "../../context/AuthContext";
import { loginWithPin } from "../../services/authService";

export default function ResetData() {
    const { user, logout } = useAuth();

    const [mode, setMode] = useState(null); // "soft" | "hard"
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");

    async function confirmReset() {
        setError("");

        if (!pin) {
            setError("PIN required");
            return;
        }

        const res = await loginWithPin({
            username: user.username,
            pin
        });

        if (!res.success) {
            setError("Invalid PIN");
            return;
        }

        if (mode === "soft") {
            softResetUserData(user.id);
            alert("Soft reset complete. Financial data cleared.");
            setMode(null);
            setPin("");
            return;
        }

        if (mode === "hard") {
            resetUserData(user.id);
            alert("All data permanently deleted.");
            logout();
        }
    }

    return (
        <div
            style={{
                marginTop: 30,
                padding: 16,
                borderRadius: 8,
                border: "1px solid #ef4444",
                background: "#fff5f5"
            }}
        >
            <h4 style={{ color: "#ef4444" }}>Danger Zone</h4>

            <p style={{ fontSize: 13 }}>
                Choose how much data you want to reset.
            </p>

            {!mode && (
                <>
                    <button
                        onClick={() => setMode("soft")}
                        style={{
                            background: "#f59e0b",
                            color: "#fff",
                            padding: "8px 12px",
                            borderRadius: 6,
                            marginRight: 10
                        }}
                    >
                        Soft Reset (Keep Account)
                    </button>

                    <button
                        onClick={() => setMode("hard")}
                        style={{
                            background: "#ef4444",
                            color: "#fff",
                            padding: "8px 12px",
                            borderRadius: 6
                        }}
                    >
                        Hard Reset (Delete Everything)
                    </button>
                </>
            )}

            {mode && (
                <>
                    <p style={{ fontSize: 13, marginTop: 10 }}>
                        {mode === "soft"
                            ? "This will delete transactions, budgets, and loans. Accounts stay."
                            : "This will delete EVERYTHING permanently."}
                    </p>

                    <input
                        type="password"
                        placeholder="Enter PIN to confirm"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        style={{ marginTop: 8 }}
                    />

                    {error && (
                        <div style={{ color: "#ef4444", marginTop: 6 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginTop: 10 }}>
                        <button
                            onClick={confirmReset}
                            style={{
                                background: "#ef4444",
                                color: "#fff",
                                padding: "6px 10px",
                                borderRadius: 6,
                                marginRight: 8
                            }}
                        >
                            Confirm
                        </button>

                        <button
                            onClick={() => {
                                setMode(null);
                                setPin("");
                                setError("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
