"use client";
import { useState } from "react";

export default function ChangePasswordPage() {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, oldPassword, newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Password changed successfully.");
    } else {
      setMessage(data.error || "Password change failed.");
    }
  }

  return (
  <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-black bg-white">
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Old Password"
        value={oldPassword}
        onChange={e => setOldPassword(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
        required
      />
      {message && <div className="mb-2 text-blue-600">{message}</div>}
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Change Password</button>
    </form>
  );
}
