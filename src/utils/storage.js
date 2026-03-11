const STORAGE_KEY = "fintrack_transactions";

// Load all transactions
export function loadTransactions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Save transactions
export function saveTransactions(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Add transaction
export function addTransaction(txn) {
    const list = loadTransactions();
    list.push(txn);
    saveTransactions(list);
    return list;
}

// Delete transaction
export function deleteTransaction(id) {
    const list = loadTransactions().filter(t => t.id !== id);
    saveTransactions(list);
    return list;
}

// Update transaction
export function updateTransaction(id, updated) {
    const list = loadTransactions().map(t =>
        t.id === id ? { ...t, ...updated } : t
    );
    saveTransactions(list);
    return list;
}
