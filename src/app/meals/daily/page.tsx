"use client";
import { useEffect, useState } from "react";

type Meal = {
  id: string;
  date: string;
  dish: string;
  username: string;
};
import { useRouter } from "next/navigation";

export default function DailyMealsPage() {
  // Get unique dishes for current user
  function getUserDishes() {
    if (!user) return [];
  const userMeals = meals.filter((m: Meal) => m.username === user.username);
  const dishSet = new Set<string>();
  userMeals.forEach((m: Meal) => dishSet.add(m.dish));
    return Array.from(dishSet);
  }
  const [showAdd, setShowAdd] = useState(false);
  const [newDish, setNewDish] = useState("");
  const [message, setMessage] = useState("");

  async function handleAddMeal() {
    setMessage("");
    if (!user || !newDish) return;
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, username: user.username, dish: newDish }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Meal added.");
      setNewDish("");
      setShowAdd(false);
      fetchMeals();
    } else {
      setMessage(data.error || "Add meal failed.");
    }
  }

  async function handleDeleteMeal(id: string) {
    setMessage("");
    const res = await fetch(`/api/meals?id=${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Meal deleted.");
      fetchMeals();
    } else {
      setMessage(data.error || "Delete failed.");
    }
  }
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; displayName?: string } | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  function handleAccountDropdownToggle() {
    setAccountDropdownOpen((open) => !open);
  }
  function handleAccountDropdownClose(e: MouseEvent) {
    const btn = document.getElementById('navDropdownBtn');
    const menu = document.getElementById('navDropdownMenu');
    if (btn && menu && !btn.contains(e.target as Node) && !menu.contains(e.target as Node)) {
      setAccountDropdownOpen(false);
    }
  }
  useEffect(() => {
    if (!accountDropdownOpen) return;
    function onClick(e: MouseEvent) { handleAccountDropdownClose(e); }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [accountDropdownOpen]);
  const [meals, setMeals] = useState([]);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);

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
  return meals.filter((m: Meal) => m.date === date);
  }

  function changeDay(offset: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().slice(0, 10));
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-xl text-gray-900">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight">Daily Meal Grid</h2>
          {user && (
            <div className="mt-1 text-sm text-gray-700">Logged in as <span className="font-semibold text-blue-700">{user.displayName || user.username}</span></div>
          )}
        </div>
        <div className="relative">
          <button
            id="navDropdownBtn"
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg shadow text-blue-900 font-semibold transition"
            onClick={handleAccountDropdownToggle}
            aria-haspopup="true"
            aria-expanded={accountDropdownOpen}
          >
            Account ▾
          </button>
          {accountDropdownOpen && (
            <div
              id="navDropdownMenu"
              className="absolute right-0 mt-2 w-48 bg-white border border-blue-200 rounded-lg shadow-lg z-10"
            >
              <a
                href="/account"
                className="block px-4 py-2 hover:bg-blue-50 text-blue-900 font-medium"
                onClick={() => setAccountDropdownOpen(false)}
              >
                Account Management
              </a>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-red-600 font-medium"
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mb-4 flex gap-2 items-center justify-center">
  <button type="button" className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-semibold shadow-md hover:from-blue-500 hover:to-blue-700 transition duration-200 mr-6" onClick={() => window.location.href='/meals'}>Dishes</button>
  <button type="button" className="px-4 py-2 rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-semibold shadow-md hover:from-green-500 hover:to-green-700 transition duration-200" onClick={() => window.location.href='/meals/daily'}>Daily</button>
  <button type="button" className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 text-white font-semibold shadow-md hover:from-purple-500 hover:to-purple-700 transition duration-200" onClick={() => window.location.href='/meals/weekly'}>Weekly</button>
  <button type="button" className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white font-semibold shadow-md hover:from-pink-500 hover:to-pink-700 transition duration-200" onClick={() => window.location.href='/meals/monthly'}>Monthly</button>
      </div>
      <script dangerouslySetInnerHTML={{__html:`
        const btn = document.getElementById('navDropdownBtn');
        const menu = document.getElementById('navDropdownMenu');
        if (btn && menu) {
          btn.onclick = () => {
            menu.classList.toggle('hidden');
          };
          document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
              menu.classList.add('hidden');
            }
          });
        }
      `}} />
      <div className="mb-4 flex gap-2 items-center">
        <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => changeDay(-1)}>&lt; Prev</button>
        <label htmlFor="date" className="font-semibold">Date:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="p-2 border rounded"
        />
        <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => changeDay(1)}>Next &gt;</button>
        <button type="button" className="px-3 py-1 bg-blue-200 rounded" onClick={() => setDate(todayStr)}>Today</button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-2 mb-2">
          <button
            className="px-2 py-1 bg-green-200 rounded text-green-800 font-bold text-lg"
            title="Add meal"
            onClick={() => setShowAdd(true)}
          >+</button>
          <span className="font-semibold">Add a dish for {date}</span>
        </div>
        {showAdd && (
          <form
            className="mb-2 flex gap-2"
            onSubmit={e => { e.preventDefault(); handleAddMeal(); }}
          >
            <input
              type="text"
              placeholder="Dish name"
              value={newDish}
              onChange={e => setNewDish(e.target.value)}
              className="flex-1 p-1 border rounded"
              required
            />
            <select
              className="p-1 border rounded"
              value={newDish}
              onChange={e => setNewDish(e.target.value)}
            >
              <option value="">Select saved dish...</option>
              {getUserDishes().map(dish => (
                <option key={dish} value={dish}>{dish}</option>
              ))}
            </select>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
            <button type="button" className="bg-gray-300 px-2 py-1 rounded" onClick={() => setShowAdd(false)}>Cancel</button>
          </form>
        )}
        {getDayMeals().length === 0 ? (
          <div className="text-gray-500">No meals planned for this day.</div>
        ) : (
          getDayMeals().map((m: Meal) => (
            <div key={m.id} className="border rounded p-4 bg-gray-50 flex items-center gap-2">
              <button
                className="px-2 py-1 bg-red-200 rounded text-red-800 font-bold text-lg"
                title="Delete meal"
                onClick={() => handleDeleteMeal(m.id)}
              >-</button>
              <div>
                <div className="font-bold">{m.dish}</div>
                <div className="text-sm text-gray-700">By: {m.username}</div>
              </div>
            </div>
          ))
        )}
        {message && <div className="text-blue-600 text-xs mt-1">{message}</div>}
      </div>
    </div>
  );
}
