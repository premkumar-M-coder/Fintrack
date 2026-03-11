import React from "react";
import "./SummaryCards.css";

const SummaryCards = ({ totalIncome, totalExpense, totalBalance }) => {
    const cards = [
        {
            title: "Total Income",
            value: `₹${totalIncome || 0}`,
            color: "#4CAF50"
        },
        {
            title: "Total Expense",
            value: `₹${totalExpense || 0}`,
            color: "#F44336"
        },
        {
            title: "Balance",
            value: `₹${totalBalance || 0}`,
            color: "#2196F3"
        }
    ];

    return (
        <div className="summary-cards-container">
            {cards.map((card, index) => (
                <div
                    className="summary-card"
                    key={index}
                    style={{ borderLeft: `6px solid ${card.color}` }}
                >
                    <h3>{card.title}</h3>
                    <p>{card.value}</p>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
