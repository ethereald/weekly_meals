"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; displayName?: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (!user) return null;

  const name = user.displayName && user.displayName.trim() ? user.displayName : user.username;
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-black bg-white">
      <h2 className="text-xl font-bold mb-4">Welcome, {name}!</h2>
      <p>Role: {user.role}</p>
      <div className="mt-4">
        <a href="/account" className="text-blue-600 underline mr-4">Account Management</a>
        {user.role === "admin" && (
          <a href="/admin" className="text-blue-600 underline">Admin Panel</a>
        )}
      </div>
      <button
        className="mt-6 w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
        onClick={() => {
          localStorage.removeItem("user");
          router.replace("/login");
        }}
      >Logout</button>
    </div>
  );
}
