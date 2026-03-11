import React, { useEffect, useMemo, useState } from "react";
import SummaryCards from "../../components/dashboard/SummaryCards";
import {
    getAllTransactions,
    getAccounts,
    getOutstandingTotals,
    getBudgets
} from "../../services/db";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import "./Dashboard.css";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [outTotals, setOutTotals] = useState({
        totalLent: 0,
        totalBorrowed: 0
    });
    const [budgets, setBudgets] = useState([]);

    const currentMonth = new Date().toISOString().slice(0, 7);

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        setTransactions(getAllTransactions() || []);
        setAccounts(getAccounts() || []);
        setOutTotals(getOutstandingTotals());
        setBudgets(getBudgets(currentMonth) || []);
    }, [currentMonth]);

    /* ================= SUMMARY ================= */
    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            if (t.type === "income") income += Number(t.amount || 0);
            if (t.type === "expense") expense += Number(t.amount || 0);
        });

        return {
            totalIncome: income,
            totalExpense: expense,
            totalBalance: income - expense
        };
    }, [transactions]);

    /* ================= MONTH EXPENSES ================= */
    const expenseThisMonth = useMemo(() => {
        return transactions.filter(
            t =>
                t.type === "expense" &&
                t.date &&
                t.date.startsWith(currentMonth)
        );
    }, [transactions, currentMonth]);

    /* ================= PIE DATA ================= */
    const expensePie = useMemo(() => {
        const map = {};
        expenseThisMonth.forEach(t => {
            const cat = t.category || "Other";
            map[cat] = (map[cat] || 0) + Number(t.amount || 0);
        });

        return Object.entries(map).map(([name, value]) => ({
            name,
            value
        }));
    }, [expenseThisMonth]);

    /* ================= OVERALL BUDGET ================= */
    const overallBudget = budgets.find(b => b.type === "overall");

    const overallSpent = expenseThisMonth.reduce(
        (s, t) => s + Number(t.amount || 0),
        0
    );

    const overallRemaining = overallBudget
        ? overallBudget.limit - overallSpent
        : null;

    /* ================= CATEGORY BUDGET USAGE ================= */
    const categoryBudgetUsage = useMemo(() => {
        return budgets
            .filter(b => b.type === "category")
            .map(b => {
                const spent = expenseThisMonth
                    .filter(t => t.category === b.category)
                    .reduce((s, t) => s + Number(t.amount || 0), 0);

                const percent = b.limit
                    ? Math.round((spent / b.limit) * 100)
                    : 0;

                return {
                    category: b.category,
                    spent,
                    limit: b.limit,
                    remaining: b.limit - spent,
                    percent: Math.min(percent, 100)
                };
            })
            .sort((a, b) => b.percent - a.percent);
    }, [budgets, expenseThisMonth]);

    /* ================= UI ================= */
    return (
        <div className="page-dashboard">
            {/* HEADER */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="muted">Overview of your finances</p>
                </div>

                <div className="stat-row">
                    <div className="stat-card">
                        <span className="label">Outstanding Lent</span>
                        <strong>₹{outTotals.totalLent}</strong>
                    </div>
                    <div className="stat-card">
                        <span className="label">Outstanding Borrowed</span>
                        <strong>₹{outTotals.totalBorrowed}</strong>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <SummaryCards
                totalIncome={summary.totalIncome}
                totalExpense={summary.totalExpense}
                totalBalance={summary.totalBalance}
            />

            {/* BUDGET + PIE */}
            <div className="two-col">
                {/* BUDGET SUMMARY */}
                <div className="card">
                    <h4>Budget Summary (This Month)</h4>

                    {!overallBudget ? (
                        <p className="muted">No overall budget set</p>
                    ) : (
                        <>
                            <strong style={{ fontSize: 20 }}>
                                ₹{overallRemaining}
                            </strong>
                            <p className="muted">
                                Spent ₹{overallSpent} / ₹
                                {overallBudget.limit}
                            </p>
                        </>
                    )}

                    {/* CATEGORY BUDGETS */}
                    {categoryBudgetUsage.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                            {categoryBudgetUsage.map(c => (
                                <div key={c.category} style={{ marginBottom: 12 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: 13,
                                            marginBottom: 4
                                        }}
                                    >
                                        <strong>{c.category}</strong>
                                        <span>{c.percent}%</span>
                                    </div>

                                    <div
                                        style={{
                                            height: 6,
                                            background: "#e5e7eb",
                                            borderRadius: 4
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${c.percent}%`,
                                                height: "100%",
                                                borderRadius: 4,
                                                background:
                                                    c.percent >= 100
                                                        ? "#ef4444"
                                                        : c.percent > 75
                                                            ? "#f59e0b"
                                                            : "#22c55e"
                                            }}
                                        />
                                    </div>

                                    <div className="muted" style={{ fontSize: 12 }}>
                                        ₹{c.spent} / ₹{c.limit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PIE CHART */}
                <div className="card">
                    <h4>Expense Breakdown</h4>

                    {expensePie.length === 0 ? (
                        <p className="muted">No expenses this month</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={expensePie}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={85}
                                    label
                                >
                                    {expensePie.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[i % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* TRANSACTIONS + ACCOUNTS */}
            <div className="dashboard-layout">
                <div>
                    <h4>Recent Transactions</h4>
                    {transactions
                        .slice(-5)
                        .reverse()
                        .map(t => (
                            <div className="txn-row" key={t.id}>
                                <div>
                                    <strong>{t.category}</strong>
                                    <div className="muted">{t.date}</div>
                                </div>
                                <strong>₹{t.amount}</strong>
                            </div>
                        ))}
                </div>

                <aside className="card">
                    <h4>Accounts</h4>
                    {accounts.map(a => (
                        <div className="account-row" key={a.id}>
                            <span>{a.name}</span>
                            <strong>₹{a.openingBalance}</strong>
                        </div>
                    ))}
                </aside>
            </div>
        </div>
    );
};

export default Dashboard;
