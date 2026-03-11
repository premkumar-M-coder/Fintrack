import { create } from "zustand";

const useAppStore = create((set) => ({
    user: null,

    accounts: [
        { id: 1, name: "Cash", balance: 9576, type: "cash" },
        { id: 2, name: "Credit Card", balance: -3578, type: "credit" },
        { id: 3, name: "Business", balance: 1350, type: "business" },
    ],

    transactions: [],

    setUser: (user) => set({ user }),
    addAccount: (acc) =>
        set((state) => ({ accounts: [...state.accounts, acc] })),

    addTransaction: (tx) =>
        set((state) => ({
            transactions: [tx, ...state.transactions],
        })),
}));

export default useAppStore;
