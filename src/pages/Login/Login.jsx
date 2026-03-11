// src/pages/Login/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate, Link } from "react-router-dom";

export default function Login() {
    const { user, loginPassword, loginPin } = useAuth();
    const [mode, setMode] = useState("password");
    const [form, setForm] = useState({
        emailOrUsername: "",
        password: "",
        username: "",
        pin: ""
    });

    function onChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handlePasswordLogin(e) {
        e.preventDefault();
        const res = await loginPassword(form.emailOrUsername, form.password);
        if (!res.success) alert(res.message);
    }

    async function handlePinLogin(e) {
        e.preventDefault();
        const res = await loginPin(form.username, form.pin);
        if (!res.success) alert(res.message);
    }

    if (user) return <Navigate to="/dashboard" replace />;

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

                {/* Mode Switch */}
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={() => setMode("password")}
                        className={`px-4 py-2 rounded-md ${mode === "password"
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-200"
                            }`}
                    >
                        Email / Username
                    </button>
                    <button
                        onClick={() => setMode("pin")}
                        className={`px-4 py-2 rounded-md ${mode === "pin"
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-200"
                            }`}
                    >
                        PIN
                    </button>
                </div>

                {/* PASSWORD LOGIN */}
                {mode === "password" && (
                    <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Email or Username</label>
                            <input
                                name="emailOrUsername"
                                value={form.emailOrUsername}
                                onChange={onChange}
                                className="w-full border p-2 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={onChange}
                                className="w-full border p-2 rounded-md"
                            />
                        </div>

                        <button className="w-full bg-indigo-600 text-white py-2 rounded-md mt-2">
                            Login
                        </button>
                    </form>
                )}

                {/* PIN LOGIN */}
                {mode === "pin" && (
                    <form onSubmit={handlePinLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Username</label>
                            <input
                                name="username"
                                value={form.username}
                                onChange={onChange}
                                className="w-full border p-2 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">4-digit PIN</label>
                            <input
                                type="password"
                                maxLength={4}
                                name="pin"
                                value={form.pin}
                                onChange={onChange}
                                className="w-full border p-2 rounded-md tracking-widest text-center"
                            />
                        </div>

                        <button className="w-full bg-indigo-600 text-white py-2 rounded-md mt-2">
                            Login with PIN
                        </button>
                    </form>
                )}

                <p className="text-center text-sm mt-4 text-gray-600">
                    Don’t have an account?{" "}
                    <Link to="/register" className="text-indigo-600 font-medium">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
