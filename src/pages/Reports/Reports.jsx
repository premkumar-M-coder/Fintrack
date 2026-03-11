import React, { useMemo, useState } from "react";
import { getAllTransactions } from "../../services/db";

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    LineChart, Line
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= HELPERS ================= */

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];
const formatINR = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "INR 0";
    return "INR " + num.toLocaleString("en-IN");
};



const getYear = () => new Date().getFullYear();

/* ================= COMPONENT ================= */

export default function Reports() {
    const [month, setMonth] = useState(
        new Date().toISOString().slice(0, 7)
    );
    const [year] = useState(getYear());

    const transactions = getAllTransactions() || [];

    /* ================= MONTH FILTER ================= */

    const monthTxns = useMemo(() => {
        return transactions.filter(t => t.date?.startsWith(month));
    }, [transactions, month]);

    /* ================= INCOME vs EXPENSE ================= */

    const incomeExpense = useMemo(() => {
        let income = 0, expense = 0;
        monthTxns.forEach(t => {
            if (t.type === "income") income += Number(t.amount || 0);
            if (t.type === "expense") expense += Number(t.amount || 0);
        });
        return [
            { name: "Income", value: income },
            { name: "Expense", value: expense }
        ];
    }, [monthTxns]);

    /* ================= CATEGORY DATA ================= */

    const categoryData = useMemo(() => {
        const map = {};
        monthTxns
            .filter(t => t.type === "expense")
            .forEach(t => {
                const c = t.category || "Other";
                map[c] = (map[c] || 0) + Number(t.amount || 0);
            });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [monthTxns]);

    /* ================= 6 MONTH TREND ================= */

    const trend = useMemo(() => {
        const res = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toISOString().slice(0, 7);

            const spent = transactions
                .filter(t =>
                    t.type === "expense" &&
                    t.date?.startsWith(key)
                )
                .reduce((s, t) => s + Number(t.amount || 0), 0);

            res.push({ month: key, spent });
        }
        return res;
    }, [transactions]);

    /* ================= YEARLY SUMMARY ================= */

    const yearlyTotals = useMemo(() => {
        let income = 0, expense = 0;
        transactions
            .filter(t => t.date?.startsWith(String(year)))
            .forEach(t => {
                if (t.type === "income") income += Number(t.amount || 0);
                if (t.type === "expense") expense += Number(t.amount || 0);
            });
        return {
            income,
            expense,
            net: income - expense
        };
    }, [transactions, year]);

    const monthlyBreakdown = useMemo(() => {
        const map = {};
        transactions
            .filter(t => t.date?.startsWith(String(year)))
            .forEach(t => {
                const m = t.date.slice(0, 7);
                if (!map[m]) map[m] = { income: 0, expense: 0 };
                if (t.type === "income") map[m].income += Number(t.amount || 0);
                if (t.type === "expense") map[m].expense += Number(t.amount || 0);
            });

        return Object.entries(map).map(([month, v]) => ({
            month,
            income: v.income,
            expense: v.expense,
            net: v.income - v.expense
        }));
    }, [transactions, year]);

    const yearlyCategories = useMemo(() => {
        const map = {};
        transactions
            .filter(t => t.type === "expense" && t.date?.startsWith(String(year)))
            .forEach(t => {
                const c = t.category || "Other";
                map[c] = (map[c] || 0) + Number(t.amount || 0);
            });
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [transactions, year]);

    /* ================= EXPORT CSV ================= */

    function exportCSV() {
        const rows = [
            ["Date", "Type", "Category", "Amount", "Notes"],
            ...monthTxns.map(t => [
                t.date,
                t.type,
                t.category,
                t.amount,
                t.notes || ""
            ])
        ];

        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `fintrack-${month}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /* ================= EXPORT PDF ================= */

    function exportPDF() {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("FinTrack Financial Report", 14, 14);

        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

        doc.setFontSize(14);
        doc.text(`Yearly Summary (${year})`, 14, 32);

        autoTable(doc, {
            startY: 36,
            head: [["Metric", "Amount"]],
            body: [
                ["Total Income", formatINR(yearlyTotals.income)],
                ["Total Expense", formatINR(yearlyTotals.expense)],
                ["Net Savings", formatINR(yearlyTotals.net)]
            ]
        });

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 14,
            head: [["Month", "Income", "Expense", "Net"]],
            body: monthlyBreakdown.map(m => [
                m.month,
                formatINR(m.income),
                formatINR(m.expense),
                formatINR(m.net)
            ])
        });

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 14,
            head: [["Category", "Amount"]],
            body: yearlyCategories.map(([cat, amt]) => [
                cat,
                formatINR(amt)
            ])
        });

        doc.save(`FinTrack_Report_${year}.pdf`);
    }

    /* ================= UI ================= */

    return (
        <div style={{ padding: 20 }}>
            <h2>Reports</h2>

            <div style={{ display: "flex", gap: 12 }}>
                <input
                    type="month"
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                />
                <button onClick={exportCSV}>Export CSV</button>
                <button onClick={exportPDF}>Export PDF</button>
            </div>

            <div style={card}>
                <h3>Income vs Expense</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={incomeExpense}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={card}>
                <h3>Category-wise Expenses</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label
                        >
                            {categoryData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div style={card}>
                <h3>Last 6 Months Expense Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trend}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="spent"
                            stroke="#ef4444"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const card = {
    background: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 16
};
