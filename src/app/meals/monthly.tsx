"use client";
import { useEffect, useState } from "react";

type Meal = {
  id: string;
  date: string;
  dish: string;
  username: string;
};
import { useRouter } from "next/navigation";

export default function MonthlyMealsPage() {
  const router = useRouter();
  // Removed unused variable 'user'.
  const [meals, setMeals] = useState([]);
  const [month, setMonth] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
  // Removed setUser usage since 'user' is not used.
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

  function getMonthMeals() {
    if (!month) return [];
    return meals.filter((m: Meal) => {
      return m.date.startsWith(month);
    });
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow text-black bg-white">
      <h2 className="text-xl font-bold mb-4">Monthly Meal Plan</h2>
      <nav className="mb-6 flex gap-4">
        <a href="/meals" className="text-blue-700 underline">All</a>
        <a href="/meals/daily" className="text-blue-700 underline">Daily</a>
        <a href="/meals/weekly" className="text-blue-700 underline">Weekly</a>
        <a href="/meals/monthly" className="text-blue-700 underline">Monthly</a>
      </nav>
      <div className="mb-4 flex gap-2 items-center">
        <label htmlFor="month" className="font-semibold">Month:</label>
        <input
          type="month"
          id="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
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
          {getMonthMeals().map((m: Meal) => (
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
