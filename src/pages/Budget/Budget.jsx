// src/pages/Budget/Budget.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    getBudgets,
    saveBudget,
    deleteBudget,
    getAllTransactions,
    getCategories,
    getSettings,
    setStrictBudget
} from "../../services/db";

const monthKey = () => new Date().toISOString().slice(0, 7);
const makeId = () => Date.now().toString();

export default function Budget() {
    const [month, setMonth] = useState(monthKey());
    const [overall, setOverall] = useState("");
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [strict, setStrict] = useState(false);

    const [cat, setCat] = useState("");
    const [catLimit, setCatLimit] = useState("");

    useEffect(() => {
        load();
    }, [month]);

    function load() {
        const b = getBudgets(month);
        setBudgets(b);
        setTransactions(getAllTransactions());
        setCategories(getCategories());

        const o = b.find(x => x.type === "overall");
        setOverall(o?.limit || "");

        setStrict(getSettings().strictBudget || false);
    }

    /* ================= SAVE OVERALL ================= */
    function saveOverall() {
        if (!overall) return alert("Enter overall budget");

        saveBudget({
            id: makeId(),
            month,
            type: "overall",
            limit: Number(overall)
        });
        load();
    }

    /* ================= SAVE CATEGORY ================= */
    function saveCategory() {
        if (!cat || !catLimit) {
            alert("Select category and limit");
            return;
        }

        saveBudget({
            id: makeId(),
            month,
            type: "category",
            category: cat,
            limit: Number(catLimit)
        });

        setCat("");
        setCatLimit("");
        load();
    }

    /* ================= CALCULATIONS ================= */
    const spentByCategory = useMemo(() => {
        const map = {};
        transactions
            .filter(t => t.type === "expense" && t.date.startsWith(month))
            .forEach(t => {
                const c = t.category || "Other";
                map[c] = (map[c] || 0) + Number(t.amount || 0);
            });
        return map;
    }, [transactions, month]);

    const overallSpent = Object.values(spentByCategory).reduce((a, b) => a + b, 0);
    const overallRemaining = Number(overall || 0) - overallSpent;

    /* ================= UI ================= */
    return (
        <div style={{ padding: 20, maxWidth: 900 }}>
            <h2>Budget & Targets</h2>

            {/* MONTH */}
            <label>Month</label>
            <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
            />

            {/* STRICT MODE */}
            <div style={{ marginTop: 10 }}>
                <label style={{ cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={strict}
                        onChange={e => {
                            setStrict(e.target.checked);
                            setStrictBudget(e.target.checked);
                        }}
                    />{" "}
                    Strict Budget Mode (Block expenses)
                </label>
            </div>

            {/* OVERALL BUDGET */}
            <div style={{ marginTop: 20, background: "#fff", padding: 12, borderRadius: 8 }}>
                <h3>Overall Budget</h3>
                <input
                    type="number"
                    value={overall}
                    onChange={e => setOverall(e.target.value)}
                    placeholder="Total monthly budget"
                />
                <button onClick={saveOverall} style={{ marginLeft: 8 }}>
                    Save
                </button>

                <div style={{ marginTop: 10 }}>
                    <div>Spent: ₹{overallSpent}</div>
                    <div>Remaining: ₹{overallRemaining}</div>
                    {overallRemaining < 0 && (
                        <div style={{ color: "red", fontWeight: 600 }}>
                            Budget exceeded
                        </div>
                    )}
                </div>
            </div>

            {/* ADD CATEGORY BUDGET */}
            <div style={{ marginTop: 20, background: "#fff", padding: 12, borderRadius: 8 }}>
                <h3>Category Budget</h3>

                <select value={cat} onChange={e => setCat(e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    value={catLimit}
                    onChange={e => setCatLimit(e.target.value)}
                    placeholder="Limit"
                    style={{ marginLeft: 8 }}
                />

                <button onClick={saveCategory} style={{ marginLeft: 8 }}>
                    Save
                </button>
            </div>

            {/* CATEGORY BUDGET LIST */}
            <div style={{ marginTop: 20 }}>
                <h3>Category Budgets</h3>

                {budgets.filter(b => b.type === "category").length === 0 ? (
                    <div style={{ color: "#666" }}>No category budgets set</div>
                ) : (
                    budgets
                        .filter(b => b.type === "category")
                        .map(b => {
                            const spent = spentByCategory[b.category] || 0;
                            const remaining = b.limit - spent;
                            const percent = Math.min(
                                100,
                                Math.round((spent / b.limit) * 100)
                            );

                            return (
                                <div
                                    key={b.id}
                                    style={{
                                        background: "#fff",
                                        padding: 12,
                                        borderRadius: 8,
                                        marginBottom: 10
                                    }}
                                >
                                    <div style={{ fontWeight: 700 }}>
                                        {b.category}
                                    </div>
                                    <div>Limit: ₹{b.limit}</div>
                                    <div>Spent: ₹{spent}</div>
                                    <div>Remaining: ₹{remaining}</div>

                                    <div
                                        style={{
                                            height: 6,
                                            background: "#e5e7eb",
                                            borderRadius: 4,
                                            marginTop: 6
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${percent}%`,
                                                height: "100%",
                                                background:
                                                    percent >= 100
                                                        ? "#ef4444"
                                                        : percent > 75
                                                            ? "#f59e0b"
                                                            : "#10b981"
                                            }}
                                        />
                                    </div>

                                    {remaining < 0 && (
                                        <div
                                            style={{
                                                color: "red",
                                                fontSize: 12,
                                                marginTop: 4
                                            }}
                                        >
                                            Exceeded
                                        </div>
                                    )}

                                    <div style={{ marginTop: 8 }}>
                                        <button
                                            onClick={() => {
                                                const nl = prompt(
                                                    "New limit",
                                                    b.limit
                                                );
                                                if (!nl) return;
                                                saveBudget({
                                                    ...b,
                                                    limit: Number(nl)
                                                });
                                                load();
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            style={{ marginLeft: 8, color: "red" }}
                                            onClick={() => {
                                                if (!window.confirm("Delete budget?"))
                                                    return;
                                                deleteBudget(b.id);
                                                load();
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
}
