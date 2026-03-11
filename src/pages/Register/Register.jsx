// src/pages/Register/Register.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Navigate, Link } from "react-router-dom";

export default function Register() {
    const { user, register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        pin: ""
    });

    const [loading, setLoading] = useState(false);

    // Already logged in → dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    function onChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleRegister(e) {
        e.preventDefault();

        if (!form.username.trim()) {
            alert("Username is required");
            return;
        }
        if (!form.password) {
            alert("Password is required");
            return;
        }
        if (form.pin && !/^\d{4}$/.test(form.pin)) {
            alert("PIN must be exactly 4 digits");
            return;
        }

        setLoading(true);
        try {
            const res = await register({
                email: form.email || null,
                username: form.username.trim(),
                password: form.password,
                pin: form.pin || null
            });

            if (!res.success) {
                alert(res.message || "Registration failed");
                return;
            }

            alert("Registered successfully. Please login.");
            navigate("/login", { replace: true });
        } catch (err) {
            console.error(err);
            alert("Registration failed. Check console.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">
                    Create account
                </h2>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <label className="flex flex-col">
                        <span className="mb-1 font-medium">Username *</span>
                        <input
                            name="username"
                            value={form.username}
                            onChange={onChange}
                            className="border p-2 rounded-md"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="mb-1 font-medium">Email (optional)</span>
                        <input
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            className="border p-2 rounded-md"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="mb-1 font-medium">Password *</span>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={onChange}
                            className="border p-2 rounded-md"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="mb-1 font-medium">
                            4-digit PIN (optional)
                        </span>
                        <input
                            name="pin"
                            value={form.pin}
                            onChange={onChange}
                            className="border p-2 rounded-md text-center tracking-widest"
                            maxLength={4}
                            inputMode="numeric"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white py-2 rounded-md disabled:opacity-60"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-sm mt-4 text-gray-600">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 font-medium"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
