// src/pages/Accounts/Accounts.jsx
import React, { useEffect, useState } from "react";
import { getAccounts, addAccount, updateAccount, deleteAccount, computeAccountBalance } from "../../services/db";
import { useNavigate } from "react-router-dom";

const makeId = () => Date.now().toString();

export default function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({ id: null, name: "", type: "bank", openingBalance: "" });
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        loadAccounts();
    }, []);

    function loadAccounts() {
        const accs = getAccounts();
        setAccounts(accs || []);
    }

    function onChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function resetForm() {
        setForm({ id: null, name: "", type: "bank", openingBalance: "" });
        setEditing(false);
    }

    function handleEdit(a) {
        setForm({ id: a.id, name: a.name, type: a.type || "bank", openingBalance: String(a.openingBalance || 0) });
        setEditing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleDelete(id) {
        if (!window.confirm("Delete account? Transactions tied to this account will NOT be deleted automatically.")) return;
        deleteAccount(id);
        loadAccounts();
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) {
            alert("Account name required");
            return;
        }
        const payload = {
            id: form.id || makeId(),
            name: form.name.trim(),
            type: form.type,
            openingBalance: Number(form.openingBalance || 0),
            createdAt: new Date().toISOString()
        };
        if (editing) updateAccount(payload);
        else addAccount(payload);

        resetForm();
        loadAccounts();
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Accounts</h2>

            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Form */}
                <div style={{ flex: 1, background: "#fff", padding: 16, borderRadius: 8 }}>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Account Name</label>
                            <input name="name" value={form.name} onChange={onChange} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }} />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Type</label>
                            <select name="type" value={form.type} onChange={onChange} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}>
                                <option value="bank">Bank</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="wallet">Wallet</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Opening Balance</label>
                            <input name="openingBalance" value={form.openingBalance} onChange={onChange} type="number" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }} />
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="submit" style={{ padding: "8px 12px", background: "#4f46e5", color: "#fff", borderRadius: 6 }}>{editing ? "Save" : "Create"}</button>
                            <button type="button" onClick={resetForm} style={{ padding: "8px 12px", borderRadius: 6 }}>Reset</button>
                        </div>
                    </form>
                </div>

                {/* List */}
                <div style={{ width: 560 }}>
                    <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
                        <h3>Accounts</h3>

                        {accounts.length === 0 ? <div style={{ color: "#666" }}>No accounts yet</div> : (
                            <div style={{ display: "grid", gap: 12 }}>
                                {accounts.map(a => {
                                    const bal = computeAccountBalance(a.id);
                                    return (
                                        <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, background: "#f8fafc" }}>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{a.name} <span style={{ fontSize: 12, color: "#666" }}>({a.type})</span></div>
                                                <div style={{ fontSize: 12, color: "#666" }}>Created: {new Date(a.createdAt).toLocaleDateString()}</div>
                                            </div>

                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <div style={{ textAlign: "right", marginRight: 6 }}>
                                                    <div style={{ fontWeight: 700 }}>₹{bal.toLocaleString()}</div>
                                                    <div style={{ fontSize: 12, color: "#666" }}>Opening ₹{Number(a.openingBalance || 0).toLocaleString()}</div>
                                                </div>

                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <button onClick={() => handleEdit(a)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>Edit</button>
                                                    <button onClick={() => handleDelete(a.id)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #ffe4e6", color: "#ef4444" }}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
