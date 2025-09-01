"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserManagement() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  async function fetchUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    // Check for admin user in localStorage (simple demo, not secure)
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      if (u.role !== "admin") {
        router.replace("/login");
      } else {
        fetchUsers();
      }
    } else {
      router.replace("/login");
    }
  }, []);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("User added.");
      setUsername("");
      setPassword("");
      setRole("user");
      fetchUsers();
    } else {
      setMessage(data.error || "Add user failed.");
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Delete user?")) return;
    const res = await fetch("/api/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("User deleted.");
      fetchUsers();
    } else {
      setMessage(data.error || "Delete failed.");
    }
  }

  async function handleChangeRole(id: string, newRole: string) {
    const res = await fetch("/api/users/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Role updated.");
      fetchUsers();
    } else {
      setMessage(data.error || "Role change failed.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow text-black bg-white">
      <button
        className="mb-4 w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
        onClick={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      >Logout</button>
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      <form onSubmit={handleAddUser} className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="flex-1 p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="flex-1 p-2 border rounded"
            required
          />
          <select value={role} onChange={e => setRole(e.target.value)} className="p-2 border rounded">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
        </div>
        {message && <div className="mb-2 text-blue-600">{message}</div>}
      </form>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.username}</td>
              <td className="p-2 border">
                <select value={u.role} onChange={e => handleChangeRole(u.id, e.target.value)} className="p-1 border rounded">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="p-2 border">
                {u.username === "admin" ? (
                  <span className="text-gray-400">Cannot delete</span>
                ) : (
                  <button onClick={() => handleDeleteUser(u.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
