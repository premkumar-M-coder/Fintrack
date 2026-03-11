// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

import {
    getCurrentSession,
    loginWithPassword,
    loginWithPin,
    logout as authLogout,
    registerUser
} from "../services/authService";

import { findUserByEmail, findUserByUsername } from "../services/db";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    /* ================= INIT SESSION ================= */
    useEffect(() => {
        const session = getCurrentSession();

        if (session?.userId) {
            const raw = localStorage.getItem("fintrack_db_v1");
            const users = raw ? JSON.parse(raw).users || [] : [];
            const found = users.find(u => u.id === session.userId);
            setUser(found || null);
        }

        setReady(true);
    }, []);

    /* ================= LOGIN ================= */
    async function loginPassword(emailOrUsername, password) {
        const res = await loginWithPassword({ emailOrUsername, password });
        if (res.success) {
            setUser(res.user);
        }
        return res;
    }

    async function loginPin(username, pin) {
        const res = await loginWithPin({ username, pin });
        if (res.success) {
            setUser(res.user);
        }
        return res;
    }

    /* ================= LOGOUT ================= */
    function logout() {
        authLogout();
        setUser(null);
    }

    /* ================= REGISTER ================= */
    async function register({ email, username, password, pin }) {
        if (username && findUserByUsername(username)) {
            return { success: false, message: "Username already exists" };
        }

        if (email && findUserByEmail(email)) {
            return { success: false, message: "Email already exists" };
        }

        const id = Date.now().toString();
        await registerUser({ id, email, username, password, pin });

        return { success: true };
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                ready,
                loginPassword,
                loginPin,
                logout,
                register
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
