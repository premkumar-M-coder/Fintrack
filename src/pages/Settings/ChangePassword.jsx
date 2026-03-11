import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../services/db";

export default function ChangePassword() {
    const { user, logout } = useAuth();

    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [pin, setPin] = useState("");

    function handleUpdate() {
        if (oldPass !== user.password) {
            alert("Old password incorrect");
            return;
        }

        updateUser({
            ...user,
            password: newPass || user.password,
            pin: pin || user.pin
        });

        alert("Security details updated. Please login again.");
        logout();
    }

    return (
        <div style={card}>
            <h3>Change Password / PIN</h3>

            <input
                type="password"
                placeholder="Current Password"
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
            />

            <input
                type="password"
                placeholder="New Password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
            />

            <input
                type="number"
                placeholder="New 4-digit PIN (optional)"
                value={pin}
                onChange={e => setPin(e.target.value)}
            />

            <button onClick={handleUpdate}>Save Changes</button>
        </div>
    );
}

const card = {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    maxWidth: 400
};
