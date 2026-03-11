// src/services/db.js
const KEY = "fintrack_db_v1";

function loadDB() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
        const empty = {
            transactions: [],
            categories: [],
            users: [],
            accounts: [],
            obligations: [],
            budgets: [],
            settings: {
                strictBudget: false
            }
            };

        localStorage.setItem(KEY, JSON.stringify(empty));
        return empty;
    }
    return JSON.parse(raw);
}

function saveDB(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
}

/* ---------------- Transactions ---------------- */
export function getAllTransactions() {
    const db = loadDB();
    return db.transactions || [];
}

/**
 * txn: { id, type, category, amount, date, notes, accountId (optional), obligationId (optional) }
 */
export function addTransaction(txn) {
    const db = loadDB();
    db.transactions = db.transactions || [];
    db.transactions.push(txn);
    saveDB(db);
    return db.transactions;
}

export function deleteTransaction(id) {
    const db = loadDB();
    db.transactions = (db.transactions || []).filter(t => t.id !== id);
    saveDB(db);
    return db.transactions;
}

/* ---------------- Categories ---------------- */
export function getCategories() {
    const db = loadDB();
    return db.categories || [];
}

export function addCategory(cat) {
    const db = loadDB();
    db.categories = db.categories || [];
    const exists = db.categories.find(c => c.name.toLowerCase() === (cat.name || "").toLowerCase());
    if (!exists) {
        db.categories.push(cat);
        saveDB(db);
    }
    return db.categories;
}

/* ---------------- Users (auth) ---------------- */
export function getUsers() {
    const db = loadDB();
    return db.users || [];
}

export function findUserByEmail(email) {
    if (!email) return null;
    const db = loadDB();
    return (db.users || []).find(u => u.email && u.email.toLowerCase() === (email || "").toLowerCase()) || null;
}

export function findUserByUsername(username) {
    if (!username) return null;
    const db = loadDB();
    return (db.users || []).find(u => u.username && u.username.toLowerCase() === (username || "").toLowerCase()) || null;
}

export function addUser(user) {
    const db = loadDB();
    db.users = db.users || [];
    db.users.push(user);
    saveDB(db);
    return user;
}

export function updateUser(user) {
    const db = loadDB();
    db.users = (db.users || []).map(u => (u.id === user.id ? user : u));
    saveDB(db);
    return user;
}

/* ---------------- Accounts ---------------- */
export function getAccounts() {
    const db = loadDB();
    return db.accounts || [];
}

export function getAccountById(id) {
    const db = loadDB();
    return (db.accounts || []).find(a => a.id === id) || null;
}

export function addAccount(account) {
    const db = loadDB();
    db.accounts = db.accounts || [];
    db.accounts.push(account);
    saveDB(db);
    return db.accounts;
}

export function updateAccount(account) {
    const db = loadDB();
    db.accounts = (db.accounts || []).map(a => (a.id === account.id ? account : a));
    saveDB(db);
    return account;
}

export function deleteAccount(id) {
    const db = loadDB();
    db.accounts = (db.accounts || []).filter(a => a.id !== id);
    saveDB(db);
    return db.accounts;
}

/* ---------------- Obligations (loans/borrows) ---------------- */
/**
 * Obligation model:
 * {
 *   id: string,
 *   type: 'lend' | 'borrow',
 *   counterparty: string,
 *   principal: number,
 *   outstanding: number,
 *   accountId: string | null,
 *   createdAt: ISOString,
 *   status: 'open' | 'closed',
 *   meta: {}
 * }
 *
 * Repayments are transactions with obligationId set.
 */

export function getObligations() {
    const db = loadDB();
    return db.obligations || [];
}

export function getObligationById(id) {
    const db = loadDB();
    return (db.obligations || []).find(o => o.id === id) || null;
}

export function addObligation(ob) {
    const db = loadDB();
    db.obligations = db.obligations || [];
    db.obligations.push(ob);
    saveDB(db);
    return ob;
}

export function updateObligation(updated) {
    const db = loadDB();
    db.obligations = (db.obligations || []).map(o => (o.id === updated.id ? updated : o));
    saveDB(db);
    return updated;
}

export function deleteObligation(id) {
    const db = loadDB();
    db.obligations = (db.obligations || []).filter(o => o.id !== id);
    saveDB(db);
    return db.obligations;
}

/**
 * addRepayment: create a transaction (repay/return) linked to obligationId, update outstanding.
 * repayment: { id?, obligationId, amount, date, accountId, notes, category? }
 */
export function addRepayment(repayment) {
    const db = loadDB();
    db.obligations = db.obligations || [];
    const ob = db.obligations.find(o => o.id === repayment.obligationId);
    if (!ob) throw new Error("Obligation not found");

    const txnType = ob.type === "lend" ? "repay" : "return";
    const txn = {
        id: repayment.id || Date.now().toString(),
        type: txnType,
        category: repayment.category || (txnType === "repay" ? "Repayment Received" : "Repayment Made"),
        accountId: repayment.accountId || ob.accountId || null,
        amount: Number(repayment.amount || 0),
        date: repayment.date || new Date().toISOString().slice(0, 10),
        notes: repayment.notes || "",
        obligationId: ob.id
    };

    db.transactions = db.transactions || [];
    db.transactions.push(txn);

    ob.outstanding = Math.max(0, Number(ob.outstanding || 0) - Number(repayment.amount || 0));
    if (ob.outstanding <= 0) ob.status = "closed";

    db.obligations = db.obligations.map(x => (x.id === ob.id ? ob : x));
    saveDB(db);

    return { txn, obligation: ob };
}

/* ---------------- Aggregations ---------------- */
export function computeAccountBalance(accountId) {
    const db = loadDB();
    const txns = db.transactions || [];

    const creditTypes = new Set(["income", "return", "repay"]);
    const debitTypes = new Set(["expense", "lend", "borrow"]);

    const account = (db.accounts || []).find(a => a.id === accountId);
    let balance = account ? Number(account.openingBalance || 0) : 0;

    txns.forEach(t => {
        if (!t || !t.accountId) return;
        if (t.accountId !== accountId) return;
        const amt = Number(t.amount || 0);
        if (creditTypes.has(t.type)) balance += amt;
        else if (debitTypes.has(t.type)) balance -= amt;
        else balance -= amt;
    });

    return balance;
}

export function getOutstandingTotals() {
    const db = loadDB();
    const obs = db.obligations || [];
    const totalLent = obs.filter(o => o.type === "lend" && o.status === "open")
        .reduce((s, o) => s + Number(o.outstanding || 0), 0);
    const totalBorrowed = obs.filter(o => o.type === "borrow" && o.status === "open")
        .reduce((s, o) => s + Number(o.outstanding || 0), 0);
    return { totalLent, totalBorrowed };
}

// ---- BUDGETS ----
export function getBudgets(month) {
    const db = loadDB();
    return db.budgets?.filter(b => b.month === month) || [];
}

export function saveBudget(budget) {
    const db = loadDB();
    db.budgets = db.budgets || [];

    const index = db.budgets.findIndex(
        b => b.month === budget.month &&
            b.type === budget.type &&
            b.category === budget.category
    );

    if (index >= 0) {
        db.budgets[index] = budget;
    } else {
        db.budgets.push(budget);
    }

    saveDB(db);
    return db.budgets;
}
export function deleteBudget(id) {
    const db = loadDB();
    db.budgets = db.budgets.filter(b => b.id !== id);
    saveDB(db);
}
// ================= SETTINGS =================

export function getSettings() {
    const db = loadDB();
    return db.settings || { strictBudget: false };
}

export function setStrictBudget(value) {
    const db = loadDB();
    db.settings = {
        ...(db.settings || {}),
        strictBudget: value
    };
    saveDB(db);
}

export function resetUserData(userId) {
    const dbKey = "fintrack_db_v1";
    const db = JSON.parse(localStorage.getItem(dbKey));

    if (!db) return;

    // keep users, wipe everything else
    db.transactions = [];
    db.accounts = [];
    db.budgets = [];
    db.obligations = [];
    db.repayments = [];

    localStorage.setItem(dbKey, JSON.stringify(db));
}
export function softResetUserData(userId) {
    const key = "fintrack_db_v1";
    const db = JSON.parse(localStorage.getItem(key));
    if (!db) return;

    // wipe activity
    db.transactions = [];
    db.budgets = [];
    db.obligations = [];
    db.repayments = [];

    // keep accounts but reset balances logically
    db.accounts = db.accounts.map(acc => ({
        ...acc,
        openingBalance: acc.openingBalance || 0
    }));

    localStorage.setItem(key, JSON.stringify(db));
}


