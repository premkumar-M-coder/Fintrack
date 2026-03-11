// src/services/authService.js
import bcrypt from "bcryptjs";
import { findUserByEmail, findUserByUsername, addUser, updateUser } from "./db";

const SALT_ROUNDS = 10;
const AUTH_KEY = "fintrack_auth_user";

// register a user: email, username, plainPassword, optional pin (string of 4 digits)
export async function registerUser({ id, email, username, password, pin }) {
    // hash password & pin
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const pinHash = pin ? await bcrypt.hash(pin, SALT_ROUNDS) : null;

    const user = {
        id,
        email: email || null,
        username: username || null,
        passwordHash,
        pinHash,
        createdAt: new Date().toISOString()
    };

    addUser(user);
    return user;
}

export async function loginWithPassword({ emailOrUsername, password }) {
    // support both email or username
    let user = findUserByEmail(emailOrUsername);
    if (!user) user = findUserByUsername(emailOrUsername);
    if (!user) return { success: false, message: "User not found" };

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return { success: false, message: "Invalid credentials" };

    // save session
    localStorage.setItem(AUTH_KEY, JSON.stringify({ userId: user.id, at: Date.now() }));
    return { success: true, user };
}

export async function loginWithPin({ username, pin }) {
    if (!username) return { success: false, message: "Username required for PIN login" };
    const user = findUserByUsername(username);
    if (!user) return { success: false, message: "User not found" };
    if (!user.pinHash) return { success: false, message: "User has not set a PIN" };

    const ok = await bcrypt.compare(pin, user.pinHash);
    if (!ok) return { success: false, message: "Invalid PIN" };

    localStorage.setItem(AUTH_KEY, JSON.stringify({ userId: user.id, at: Date.now() }));
    return { success: true, user };
}

export function logout() {
    localStorage.removeItem(AUTH_KEY);
}

export function getCurrentSession() {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
}
