"use client";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const router = require('next/navigation').useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ username: string; displayName?: string; role: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
  setUser(data.user);
  // Persist all user fields in localStorage (including weekStart, color, etc)
  localStorage.setItem("user", JSON.stringify(data.user));
  router.replace("/meals/weekly");
    } else {
      setError(data.error || "Login failed");
    }
  }

  // Redirect if already logged in
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      router.replace("/meals/weekly");
    }
  }, [router]);

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-black bg-white">
        <h2 className="text-xl font-bold mb-4">Welcome, {(user.displayName && user.displayName.trim()) ? user.displayName : user.username}!</h2>
        <p>Role: {user.role}</p>
        <button
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
          onClick={() => {
            localStorage.removeItem("user");
            setUser(null);
          }}
        >Logout</button>
      </div>
    );
  }

  return (
  <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-black bg-white">
      <h2 className="text-xl font-bold mb-4">Login</h2>
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
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
        required
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
    </form>
  );
}
