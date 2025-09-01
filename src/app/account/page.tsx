"use client";
import { useState, useEffect, useMemo } from "react";

export default function AccountPage() {
  const [user, setUser] = useState<{ email: string; username: string; displayName?: string; color?: string; weekStart?: string } | null>(null);
  const [weekStart, setWeekStart] = useState<string>("Monday");
  const [displayName, setDisplayName] = useState("");
  const defaultUserColors = useMemo(() => [
    "bg-blue-400 text-white",
    "bg-green-500 text-white",
    "bg-yellow-500 text-white",
    "bg-pink-500 text-white",
    "bg-purple-500 text-white",
    "bg-orange-500 text-white",
    "bg-teal-500 text-white",
    "bg-red-500 text-white",
    "bg-indigo-500 text-white",
    "bg-cyan-500 text-white",
  ], []);
  const [userColors, setUserColors] = useState<string[]>(defaultUserColors);
  const [color, setColor] = useState<string>("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser({
        email: u.email,
        username: u.username || u.email,
        displayName: u.displayName || "",
        color: u.color || defaultUserColors[0],
        weekStart: u.weekStart || "Monday"
      });
      setDisplayName(u.displayName || "");
      setWeekStart(u.weekStart || "Monday");
      // Always show the saved color, even if not in palette
      if (u.color && !defaultUserColors.includes(u.color)) {
        setUserColors([u.color, ...defaultUserColors]);
        setColor(u.color);
      } else {
        setUserColors(defaultUserColors);
        setColor(u.color ? u.color : defaultUserColors[0]);
      }
    } else {
      // Try to fetch user info from backend if localStorage is not available
      const fetchUser = async () => {
        // Try to get username from session or prompt (customize as needed)
  // Removed unused variable 'username'.
        // If you have a session or context, get username from there
        // For demo, fallback to first user in backend
        const res = await fetch("/api/users");
        const users = await res.json();
        if (users && users.length > 0) {
          const u = users[0];
          setUser({
            email: u.email || "",
            username: u.username,
            displayName: u.displayName || "",
            color: u.color || defaultUserColors[0],
            weekStart: u.weekStart || "Monday"
          });
          setDisplayName(u.displayName || "");
          setWeekStart(u.weekStart || "Monday");
          if (u.color && !defaultUserColors.includes(u.color)) {
            setUserColors([u.color, ...defaultUserColors]);
            setColor(u.color);
          } else {
            setUserColors(defaultUserColors);
            setColor(u.color ? u.color : defaultUserColors[0]);
          }
        }
      };
      fetchUser();
    }
  }, [defaultUserColors]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!user) return;
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, displayName, color, oldPassword, newPassword, weekStart }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Account updated.");
      setOldPassword("");
      setNewPassword("");
      // Update local user info with new displayName, color, and weekStart
      localStorage.setItem("user", JSON.stringify({ ...user, displayName, color, weekStart }));
      // Reload user info from localStorage to ensure all fields are correct
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setUser({
          email: u.email,
          username: u.username || u.email,
          displayName: u.displayName || "",
          color: u.color || defaultUserColors[0],
          weekStart: u.weekStart || "Monday"
        });
        setDisplayName(u.displayName || "");
        setWeekStart(u.weekStart || "Monday");
        if (u.color && !defaultUserColors.includes(u.color)) {
          setUserColors([u.color, ...defaultUserColors]);
          setColor(u.color);
        } else {
          setUserColors(defaultUserColors);
          setColor(u.color ? u.color : defaultUserColors[0]);
        }
      }
    } else {
      setMessage("Update failed.");
    }
  }

  if (!user) {
    return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-black bg-white">Please log in.</div>;
  }

  return (
  <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-black bg-white">
          <h2 className="text-xl font-bold mb-4">Account Management</h2>
          <div className="mb-2">
            <label className="block font-semibold mb-1">Username:</label>
            <input
              type="text"
              value={user.username}
              readOnly
              className="w-full mb-2 p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1">Display Name:</label>
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1">Start Day of Week:</label>
            <select
              className="w-full mb-2 p-2 border rounded"
              value={weekStart}
              onChange={e => setWeekStart(e.target.value)}
            >
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1">User Color:</label>
            <div className="flex flex-wrap gap-2">
              {userColors.map((c, idx) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${c} ${color === c ? 'ring-2 ring-blue-600' : ''}`}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${idx+1}`}
                />
              ))}
            </div>
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1">New Password:</label>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            />
          </div>
          {message && <div className="mb-2 text-blue-600">{message}</div>}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-semibold shadow-md hover:from-green-500 hover:to-green-700 transition duration-200 w-full">Save Changes</button>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="button" className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 text-white font-semibold shadow-md hover:from-purple-500 hover:to-purple-700 transition duration-200 w-full" onClick={() => window.location.href='/meals/weekly'}>Go to Weekly View</button>
          </div>
        </form>
  );
}
