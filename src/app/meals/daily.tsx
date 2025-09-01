"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DailyMealsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [meals, setMeals] = useState([]);
  const [date, setDate] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.replace("/login");
    }
    fetchMeals();
  }, [router]);

  async function fetchMeals() {
    const res = await fetch("/api/meals");
    const data = await res.json();
    setMeals(data);
  }

  function getDayMeals() {
    if (!date) return [];
    return meals.filter((m: any) => m.date === date);
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow text-black bg-white">
      <h2 className="text-xl font-bold mb-4">Daily Meal Plan</h2>
      <nav className="mb-6 flex gap-4">
        <a href="/meals" className="text-blue-700 underline">All</a>
        <a href="/meals/daily" className="text-blue-700 underline">Daily</a>
        <a href="/meals/weekly" className="text-blue-700 underline">Weekly</a>
        <a href="/meals/monthly" className="text-blue-700 underline">Monthly</a>
      </nav>
      <div className="mb-4 flex gap-2 items-center">
        <label htmlFor="date" className="font-semibold">Date:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Dish</th>
            <th className="p-2 border">User</th>
          </tr>
        </thead>
        <tbody>
          {getDayMeals().map((m: any) => (
            <tr key={m.id}>
              <td className="p-2 border">{m.date}</td>
              <td className="p-2 border">{m.dish}</td>
              <td className="p-2 border">{m.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
