import React from "react";

export default function Help() {
    return (
        <div style={card}>
            <h3>Help & Support</h3>

            <p><strong>How data is stored?</strong></p>
            <p>
                FinTrack stores all data locally on your device.
                No internet connection required.
            </p>

            <p><strong>Facing issues?</strong></p>
            <ul>
                <li>Check date & category while adding transactions</li>
                <li>Ensure correct account selection</li>
                <li>Budgets apply monthly</li>
            </ul>

            <p><strong>Contact</strong></p>
            <p>Email: support@fintrack.local</p>
            <p>Developer: Prem Kumar</p>
        </div>
    );
}

const card = {
    background: "#fff",
    padding: 16,
    borderRadius: 8
};
