import React from "react";

export default function About() {
    return (
        <div style={{ maxWidth: 700 }}>
            <h3>About FinTrack</h3>

            <p style={{ color: "#555", marginBottom: 16 }}>
                FinTrack is a personal finance management application designed
                to track income, expenses, budgets, loans, and financial goals.
                All data is stored locally on your device for privacy.
            </p>

            {/* APP INFO */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h4>Application Details</h4>
                <p><strong>Name:</strong> FinTrack</p>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Platform:</strong> Desktop / Local Web</p>
                <p><strong>Data Storage:</strong> Local device only</p>
            </div>

            {/* DEVELOPER */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h4>Developer</h4>

                <p>
                    <strong>Name:</strong> M Prem Kumar
                </p>

                <p>
                    <strong>Contact:</strong> +91 84289696006
                </p>

                <p style={{ fontSize: 13, color: "#666" }}>
                    Responsible for application design, architecture,
                    development, and maintenance.
                </p>
            </div>

            {/* TESTER */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h4>Tester</h4>

                <p>
                    <strong>Name:</strong> Yaswanth V J
                </p>

                <p>
                    <strong>Contact:</strong> +91 8870579527
                </p>

                <p style={{ fontSize: 13, color: "#666" }}>
                    Responsible for testing workflows, identifying bugs,
                    and validating user experience.
                </p>
            </div>

            {/* TECH */}
            <div className="card">
                <h4>Technology Stack</h4>
                <ul style={{ color: "#555" }}>
                    <li>React (Frontend)</li>
                    <li>Local Storage (Offline Data)</li>
                    <li>Recharts (Data Visualization)</li>
                    <li>Electron (Desktop Packaging)</li>
                </ul>
            </div>
        </div>
    );
}
