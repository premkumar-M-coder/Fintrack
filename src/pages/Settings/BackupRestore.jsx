import React from "react";

const STORAGE_KEY = "fintrack_db_v1";

export default function BackupRestore() {
    /* ================= EXPORT ================= */
    function handleExport() {
        const data = localStorage.getItem(STORAGE_KEY);

        if (!data) {
            alert("No data found to export.");
            return;
        }

        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `fintrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /* ================= IMPORT ================= */
    function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);

                // Basic validation
                if (!parsed.users || !parsed.transactions) {
                    alert("Invalid backup file.");
                    return;
                }

                const confirm = window.confirm(
                    "⚠️ This will overwrite ALL existing data.\n\nDo you want to continue?"
                );

                if (!confirm) return;

                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

                alert("Data restored successfully. App will reload now.");
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert("Failed to import backup file.");
            }
        };

        reader.readAsText(file);
    }

    return (
        <div style={{ marginTop: 20 }}>
            <h3>Backup & Restore</h3>

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button onClick={handleExport} className="btn-primary">
                    Export Data
                </button>

                <label className="btn-secondary">
                    Import Data
                    <input
                        type="file"
                        accept=".json"
                        hidden
                        onChange={handleImport}
                    />
                </label>
            </div>

            <p style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
                Export saves all users, transactions, accounts, budgets.
                Import will replace existing data.
            </p>
        </div>
    );
}
