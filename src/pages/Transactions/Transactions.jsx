// src/pages/Transactions/Transactions.jsx
import React, { useEffect, useState } from "react";
import {
    getAllTransactions,
    addTransaction,
    getCategories,
    addCategory,
    deleteTransaction,
    getAccounts,
    addObligation,
    getObligations,
    addRepayment
} from "../../services/db";

import "./Transactions.css";
import { getBudgets } from "../../services/db";


const makeId = () => Date.now().toString();

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [obligations, setObligations] = useState([]);
    const [form, setForm] = useState({
        type: "expense",
        category: "",
        accountId: "",
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        createObligation: false,
        counterparty: "",
        // for repay/return
        obligationId: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadAll() {
        setLoading(true);
        try {
            const [txns, cats] = await Promise.all([getAllTransactions(), getCategories()]);
            const accs = getAccounts();
            const obs = getObligations();
            setTransactions(txns || []);
            setCategories(cats || []);
            setAccounts(accs || []);
            setObligations(obs || []);
            if ((!form.accountId || form.accountId === "") && accs && accs.length > 0) {
                setForm(prev => ({ ...prev, accountId: accs[0].id }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function onChange(e) {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") setForm(prev => ({ ...prev, [name]: checked }));
        else setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!form.amount || Number(form.amount) <= 0) {
            alert("Enter a valid amount");
            return;
        }

        // normalize category
        let selectedCategory = (form.category || "").trim();
        if (!selectedCategory) selectedCategory = form.type === "income" ? "Income" : "Other";

        // ensure category exists
        const exists = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
        if (!exists) {
            const id = makeId();
            await addCategory({ id, name: selectedCategory, type: form.type });
            const cats = await getCategories();
            setCategories(cats);
        }

        // If user is recording a repayment for an obligation and selected one,
        // call addRepayment which updates obligation.outstanding and creates txn.
        if ((form.type === "repay" || form.type === "return") && form.obligationId) {
            try {
                await addRepayment({
                    id: makeId(),
                    obligationId: form.obligationId,
                    amount: Number(form.amount),
                    accountId: form.accountId || null,
                    date: form.date,
                    notes: form.notes,
                    category: selectedCategory
                });
                // After repayment, refresh obligations and transactions
                await loadAll();
                // reset form (keep account selected)
                setForm(prev => ({
                    ...prev,
                    type: "expense",
                    category: "",
                    amount: "",
                    date: new Date().toISOString().slice(0, 10),
                    notes: "",
                    createObligation: false,
                    counterparty: "",
                    obligationId: ""
                }));
            } catch (err) {
                console.error("Repayment failed", err);
                alert("Failed to record repayment.");
            }
            return;
        }

        // Normal transaction flow (including lend/borrow creation)
        const txn = {
            id: makeId(),
            type: form.type,
            category: selectedCategory,
            accountId: form.accountId || null,
            amount: Number(form.amount),
            date: form.date,
            notes: form.notes || ""
        };

        await addTransaction(txn);

        // If user asked to create obligation for lend/borrow
        if (form.createObligation && (txn.type === "lend" || txn.type === "borrow")) {
            const ob = {
                id: makeId(),
                type: txn.type,
                counterparty: (form.counterparty || "").trim() || "Unknown",
                principal: Number(txn.amount),
                outstanding: Number(txn.amount),
                accountId: txn.accountId || null,
                createdAt: new Date().toISOString(),
                status: "open",
                meta: {}
            };
            addObligation(ob);
        }

        setForm({
            type: "expense",
            category: "",
            accountId: accounts && accounts.length ? accounts[0].id : "",
            amount: "",
            date: new Date().toISOString().slice(0, 10),
            notes: "",
            createObligation: false,
            counterparty: "",
            obligationId: ""
        });

        if (form.type === "expense") {
            const month = form.date.slice(0, 7);
            const budgets = getBudgets(month);

            const txns = getAllTransactions().filter(
                t => t.type === "expense" && t.date.startsWith(month)
            );

            const totalSpent = txns.reduce((s, t) => s + Number(t.amount), 0);
            const categorySpent = txns
                .filter(t => t.category === form.category)
                .reduce((s, t) => s + Number(t.amount), 0);

            const overall = budgets.find(b => b.type === "overall");
            const cat = budgets.find(b => b.type === "category" && b.category === form.category);

            if (
                (overall && totalSpent + Number(form.amount) > overall.limit) ||
                (cat && categorySpent + Number(form.amount) > cat.limit)
            ) {
                const ok = window.confirm("⚠ Budget exceeded. Continue anyway?");
                if (!ok) return;
            }
        }


        await loadAll();
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete transaction?")) return;
        try {
            await deleteTransaction(id);
            await loadAll();
        } catch (err) {
            console.error(err);
            alert("Failed to delete");
        }
    }

    const inputStyle = {
        width: "100%",
        padding: "8px 10px",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        boxSizing: "border-box"
    };

    const findAccountName = (accountId) => {
        if (!accountId) return "No account";
        const a = accounts.find(x => x.id === accountId);
        return a ? a.name : "Unknown account";
    };

    // helper: only open obligations and label them
    const openObligations = (type) => {
        return obligations.filter(o => o.status === "open" && o.type === (type === "repay" ? "lend" : "borrow"));
        // explanation: when user selects `repay` they are receiving money on a 'lend' obligation
        // when user selects `return` they are paying back a 'borrow' obligation
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Transactions</h2>

            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ flex: 1, background: "#fff", padding: 16, borderRadius: 8 }}>
                    <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Account</label>
                            <select name="accountId" value={form.accountId} onChange={onChange} style={inputStyle}>
                                <option value="">No account</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Type</label>
                            <select name="type" value={form.type} onChange={onChange} style={inputStyle}>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                                <option value="lend">Lend</option>
                                <option value="borrow">Borrow</option>
                                <option value="repay">Repay</option>
                                <option value="return">Return</option>
                            </select>
                        </div>

                        {/* If repay/return: show obligation dropdown so repayment updates obligation */}
                        {(form.type === "repay" || form.type === "return") && (
                            <div>
                                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                                    Select obligation to {form.type === "repay" ? "receive repayment for" : "apply repayment to"}
                                </label>
                                <select
                                    name="obligationId"
                                    value={form.obligationId}
                                    onChange={onChange}
                                    style={inputStyle}
                                >
                                    <option value="">-- choose obligation (optional) --</option>
                                    {openObligations(form.type).map(o => (
                                        <option key={o.id} value={o.id}>
                                            {o.counterparty} • {o.type} • ₹{Number(o.outstanding || 0).toLocaleString()} outstanding
                                        </option>
                                    ))}
                                </select>
                                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                                    If you leave this blank, the repayment will be saved as a normal transaction and will not modify obligations.
                                </div>
                            </div>
                        )}

                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Category</label>
                            <input name="category" value={form.category} onChange={onChange} placeholder="e.g., Food, Salary" style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Amount</label>
                            <input name="amount" value={form.amount} onChange={onChange} type="number" style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Date</label>
                            <input name="date" value={form.date} onChange={onChange} type="date" style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Notes</label>
                            <input name="notes" value={form.notes} onChange={onChange} style={inputStyle} />
                        </div>

                        {(form.type === "lend" || form.type === "borrow") && (
                            <div style={{ border: "1px dashed #e5e7eb", padding: 10, borderRadius: 6 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <label style={{ fontWeight: 600, marginRight: 8 }}>
                                        <input type="checkbox" name="createObligation" checked={form.createObligation} onChange={onChange} /> Create obligation record
                                    </label>
                                </div>

                                {form.createObligation && (
                                    <div style={{ display: "grid", gap: 8 }}>
                                        <label style={{ display: "block" }}>
                                            Counterparty (person/entity)
                                            <input name="counterparty" value={form.counterparty} onChange={onChange} style={inputStyle} placeholder="e.g., Ravi" />
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="submit" className="btn">Add</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setForm({
                                type: "expense",
                                category: "",
                                accountId: accounts && accounts.length ? accounts[0].id : "",
                                amount: "",
                                date: new Date().toISOString().slice(0, 10),
                                notes: "",
                                createObligation: false,
                                counterparty: "",
                                obligationId: ""
                            })}>Reset</button>
                        </div>
                    </form>
                </div>

                <div style={{ width: 520 }}>
                    <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
                        <h3>Recent</h3>
                        {loading ? <div>Loading...</div> : (
                            transactions.length === 0 ? <div style={{ color: "#666" }}>No transactions</div> : (
                                <div style={{ display: "grid", gap: 8 }}>
                                    {transactions.slice(0).reverse().map(t => (
                                        <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 6, background: "#f8fafc" }}>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{t.category} <span style={{ fontSize: 12, color: "#666" }}>• {findAccountName(t.accountId)}{t.obligationId ? ` • Obl:${t.obligationId.slice(-6)}` : ""}</span></div>
                                                <div style={{ fontSize: 12, color: "#666" }}>{t.date} {t.notes ? `• ${t.notes}` : ""}</div>
                                            </div>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <div style={{ fontWeight: 700, color: t.type === "income" ? "#2e7d32" : "#d32f2f" }}>
                                                    {t.type === "income" ? "+" : "-"}₹{t.amount}
                                                </div>
                                                <button onClick={() => handleDelete(t.id)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>

                    <div style={{ marginTop: 12, background: "#fff", padding: 12, borderRadius: 8 }}>
                        <h4>Saved categories</h4>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {categories.length === 0 ? <div style={{ color: "#666" }}>No categories</div> : categories.map(c => (
                                <div key={c.id} style={{ padding: "6px 10px", background: "#f1f5f9", borderRadius: 6 }}>{c.name}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
