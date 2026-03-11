// src/pages/Obligations/Obligations.jsx
import React, { useEffect, useState } from "react";
import {
    getObligations,
    addObligation,
    deleteObligation,
    getAccounts,
    addRepayment,
    getAllTransactions,
    getCategories
} from "../../services/db";

const makeId = () => Date.now().toString();

export default function Obligations() {
    const [obs, setObs] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({ type: "lend", counterparty: "", principal: "", accountId: "" });
    const [repayState, setRepayState] = useState({}); // map obligationId -> {show, amount, accountId, notes, date}

    useEffect(() => {
        loadAll();
    }, []);

    function loadAll() {
        setObs(getObligations() || []);
        setAccounts(getAccounts() || []);
    }

    function onChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function resetForm() {
        setForm({ type: "lend", counterparty: "", principal: "", accountId: accounts && accounts.length ? accounts[0].id : "" });
    }

    function handleCreate(e) {
        e.preventDefault();
        if (!form.counterparty.trim() || !form.principal || Number(form.principal) <= 0) {
            alert("Counterparty and principal required");
            return;
        }
        const ob = {
            id: makeId(),
            type: form.type,
            counterparty: form.counterparty.trim(),
            principal: Number(form.principal),
            outstanding: Number(form.principal),
            accountId: form.accountId || null,
            createdAt: new Date().toISOString(),
            status: "open",
            meta: {}
        };
        addObligation(ob);
        resetForm();
        loadAll();
    }

    function handleDelete(id) {
        if (!window.confirm("Delete obligation? This will not delete related transactions.")) return;
        deleteObligation(id);
        loadAll();
    }

    function toggleRepay(ob) {
        setRepayState(prev => ({ ...prev, [ob.id]: { show: !(prev[ob.id] && prev[ob.id].show), amount: "", accountId: ob.accountId || (accounts[0] && accounts[0].id) || "", notes: "", date: new Date().toISOString().slice(0, 10) } }));
    }

    async function submitRepayment(obId) {
        const st = repayState[obId];
        if (!st || !st.amount || Number(st.amount) <= 0) {
            alert("Enter valid repayment amount");
            return;
        }
        try {
            const res = addRepayment({
                id: makeId(),
                obligationId: obId,
                amount: Number(st.amount),
                accountId: st.accountId,
                date: st.date,
                notes: st.notes,
                category: "Repayment"
            });
            // res contains txn and obligation
            alert("Repayment recorded");
            loadAll();
            // hide repay UI
            setRepayState(prev => ({ ...prev, [obId]: { ...(prev[obId] || {}), show: false } }));
        } catch (err) {
            console.error(err);
            alert("Failed to record repayment");
        }
    }

    function updateRepayField(obId, field, value) {
        setRepayState(prev => ({ ...prev, [obId]: { ...(prev[obId] || {}), [field]: value } }));
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Obligations (Loans & Borrows)</h2>

            <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1, background: "#fff", padding: 12, borderRadius: 8 }}>
                    <h3>Create obligation</h3>
                    <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label>
                            Type
                            <select name="type" value={form.type} onChange={onChange} style={{ width: "100%", padding: 8, marginTop: 6 }}>
                                <option value="lend">Lend (I gave money)</option>
                                <option value="borrow">Borrow (I took money)</option>
                            </select>
                        </label>

                        <label>
                            Counterparty
                            <input name="counterparty" value={form.counterparty} onChange={onChange} style={{ width: "100%", padding: 8, marginTop: 6 }} />
                        </label>

                        <label>
                            Principal
                            <input name="principal" value={form.principal} onChange={onChange} type="number" style={{ width: "100%", padding: 8, marginTop: 6 }} />
                        </label>

                        <label>
                            Account
                            <select name="accountId" value={form.accountId} onChange={onChange} style={{ width: "100%", padding: 8, marginTop: 6 }}>
                                <option value="">(no account)</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </label>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="submit" style={{ padding: "8px 12px", background: "#4f46e5", color: "#fff", borderRadius: 6 }}>Create</button>
                            <button type="button" onClick={resetForm} style={{ padding: "8px 12px", borderRadius: 6 }}>Reset</button>
                        </div>
                    </form>
                </div>

                <div style={{ width: 720 }}>
                    <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
                        <h3>Active obligations</h3>
                        {obs.length === 0 ? <div style={{ color: "#666" }}>No obligations</div> : (
                            <div style={{ display: "grid", gap: 8 }}>
                                {obs.map(o => (
                                    <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: 10, borderRadius: 6, background: "#f8fafc" }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{o.counterparty} <span style={{ color: "#666", fontSize: 12 }}>({o.type})</span></div>
                                            <div style={{ fontSize: 12, color: "#666" }}>Principal: ₹{Number(o.principal || 0).toLocaleString()} • Outstanding: ₹{Number(o.outstanding || 0).toLocaleString()}</div>
                                            <div style={{ fontSize: 12, color: "#666" }}>Account: {o.accountId || "(no account)"} • Created: {new Date(o.createdAt).toLocaleDateString()}</div>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button onClick={() => toggleRepay(o)} style={{ padding: "6px 8px", borderRadius: 6 }}>Record repayment</button>
                                                <button onClick={() => handleDelete(o.id)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #ffe4e6", color: "#ef4444" }}>Delete</button>
                                            </div>

                                            {repayState[o.id] && repayState[o.id].show && (
                                                <div style={{ marginTop: 8, width: 360, background: "#fff", padding: 8, borderRadius: 6, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                                                    <div style={{ fontSize: 13, marginBottom: 6 }}>Record repayment for {o.counterparty} (outstanding ₹{Number(o.outstanding || 0).toLocaleString()})</div>
                                                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                                        <input placeholder="Amount" type="number" value={repayState[o.id].amount} onChange={e => updateRepayField(o.id, "amount", e.target.value)} style={{ flex: 1, padding: 8 }} />
                                                        <select value={repayState[o.id].accountId} onChange={e => updateRepayField(o.id, "accountId", e.target.value)} style={{ width: 160, padding: 8 }}>
                                                            <option value="">(no account)</option>
                                                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                                        <input type="date" value={repayState[o.id].date} onChange={e => updateRepayField(o.id, "date", e.target.value)} style={{ padding: 8 }} />
                                                        <input placeholder="Notes" value={repayState[o.id].notes} onChange={e => updateRepayField(o.id, "notes", e.target.value)} style={{ flex: 1, padding: 8 }} />
                                                    </div>
                                                    <div style={{ display: "flex", gap: 8 }}>
                                                        <button onClick={() => submitRepayment(o.id)} style={{ padding: "8px 10px", background: "#10b981", color: "#fff", borderRadius: 6 }}>Submit</button>
                                                        <button onClick={() => toggleRepay(o)} style={{ padding: "8px 10px", borderRadius: 6 }}>Cancel</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 12, background: "#fff", padding: 12, borderRadius: 8 }}>
                        <h4>History (recent transactions)</h4>
                        <RecentTransactions />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* small helper component for recent transactions used in obligations page */
function RecentTransactions() {
    const txns = getAllTransactions().slice(0).reverse().slice(0, 12);
    return (
        <div style={{ display: "grid", gap: 6 }}>
            {txns.length === 0 ? <div style={{ color: "#666" }}>No transactions</div> : txns.map(t => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderRadius: 6, background: "#f8fafc" }}>
                    <div>
                        <div style={{ fontWeight: 700 }}>{t.category}{t.obligationId ? ` • Obl:${t.obligationId.slice(-6)}` : ""}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{t.date} {t.notes ? `• ${t.notes}` : ""}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{t.type === "income" ? "+" : "-"}₹{t.amount}</div>
                </div>
            ))}
        </div>
    );
}
