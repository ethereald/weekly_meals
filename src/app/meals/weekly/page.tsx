"use client";
import { useEffect, useState } from "react";

type Meal = {
  id: string;
  date: string;
  dish: string;
  username: string;
};
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const WeeklyMealsContent: React.FC = () => {
  // --- HOOKS & LOGIC ---
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editingDish, setEditingDish] = useState<string>("");
  const [showAdd, setShowAdd] = useState<{ date: string, open: boolean }>({ date: "", open: false });
  const [newDish, setNewDish] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<{ username: string; role?: string; displayName?: string } | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, { id: number, username: string, displayName: string, color?: string }>>({});
  const [meals, setMeals] = useState<Meal[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const startParam = searchParams?.get("start");
  const [weekStart, setWeekStart] = useState(() => getCurrentWeekStart(startParam || undefined));

  // --- FUNCTIONS ---
  function getUserWeekStart() {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        return u.weekStart || "Monday";
      }
    }
    return "Monday";
  }
  function getUserDishes() {
    if (!user) return [];
    const userMeals = meals.filter((m: Meal) => m.username === user.username);
    const dishSet = new Set<string>();
    userMeals.forEach((m: Meal) => dishSet.add(m.dish));
    return Array.from(dishSet);
  }
  async function handleEditMeal(id: string, dish: string) {
    setMessage("");
    const res = await fetch("/api/meals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, dish }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Meal updated.");
      setEditingMealId(null);
      setEditingDish("");
      fetchMeals();
    } else {
      setMessage(data.error || "Edit meal failed.");
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
  async function handleAddMeal(date: string) {
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
      setShowAdd({ date: "", open: false });
      fetchMeals();
    } else {
      setMessage(data.error || "Add meal failed.");
    }
  }
  function changeWeek(offset: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + offset * 7);
    setWeekStart(d.toISOString().slice(0, 10));
  }
  function getCurrentWeekStart(dateStr?: string) {
    const base = dateStr ? new Date(dateStr) : new Date();
    const weekStart = getUserWeekStart();
    const day = base.getDay();
    const startDayIdx = weekStart === "Sunday" ? 0
      : weekStart === "Monday" ? 1
      : weekStart === "Tuesday" ? 2
      : weekStart === "Wednesday" ? 3
      : weekStart === "Thursday" ? 4
      : weekStart === "Friday" ? 5
      : weekStart === "Saturday" ? 6
      : 1;
    const diff = base.getDate() - ((day + 7 - startDayIdx) % 7);
    base.setDate(diff);
    return base.toISOString().slice(0, 10);
  }
  function getWeekGrid() {
    const allDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekStartName = getUserWeekStart();
    const startIdx = allDayNames.indexOf(weekStartName);
    const dayNames = [...allDayNames.slice(startIdx), ...allDayNames.slice(0, startIdx)];
    const start = new Date(weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const mealsForDay = meals.filter((m: Meal) => m.date === dateStr);
      return { date: dateStr, meals: mealsForDay, dayName: dayNames[i] };
    });
  }
  function getUserColor(username: string) {
    const userColors = [
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
    ];
    if (userMap[username] && userMap[username].color) {
      return userMap[username].color;
    }
    let id = username;
    let displayName = username;
    if (userMap[username]) {
      id = String(userMap[username].id);
      displayName = userMap[username].displayName;
    }
    let hash = 0;
    const key = id + displayName;
    for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
    return userColors[Math.abs(hash) % userColors.length];
  }
  function getDisplayName(key: string) {
    const user = userMap[key];
    if (!user) {
      const found = Object.values(userMap).find(u => u.username === key || String(u.id) === key);
      return found && found.displayName ? found.displayName : key;
    }
    return user.displayName;
  }
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
    async function fetchUsers() {
      const res = await fetch("/api/users");
      const data = await res.json();
      const map: Record<string, { id: number, username: string, displayName: string }> = {};
      for (const u of data) {
        map[u.username] = u;
        map[String(u.id)] = u;
      }
      setUserMap(map);
    }
    fetchUsers();
  }, []);
  useEffect(() => {
    if (!accountDropdownOpen) return;
    function onClick(e: MouseEvent) { handleAccountDropdownClose(e); }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [accountDropdownOpen]);
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser({
        username: u.username,
        role: u.role,
        displayName: u.displayName || u.username
      });
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

  // --- RETURN JSX ---
  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-xl text-gray-900">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight">Weekly Meal Grid</h2>
          {user ? (
            <div className="mt-1 text-sm text-gray-700">Logged in as <span className="font-semibold text-blue-700">{user.displayName || user.username}</span></div>
          ) : null}
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
          <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 items-center">
              <button type="button" className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg shadow text-blue-900 font-semibold transition" onClick={() => changeWeek(-1)}>&lt; Prev</button>
              <label htmlFor="week" className="font-semibold text-blue-900">Week starting:</label>
              <input
                type="date"
                id="week"
                value={weekStart}
                onChange={e => setWeekStart(e.target.value)}
                className="p-2 border-2 border-blue-200 rounded-lg focus:border-blue-400 outline-none transition"
              />
              <button type="button" className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg shadow text-blue-900 font-semibold transition" onClick={() => changeWeek(1)}>Next &gt;</button>
            </div>
            <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow font-semibold transition" onClick={() => setWeekStart(getCurrentWeekStart())}>Current Week</button>
          </div>
      <div className="grid grid-cols-1 gap-6">
            {getWeekGrid().map(day => (
              <div key={day.date} className="rounded-2xl bg-white shadow-lg p-6 relative group hover:shadow-2xl transition-all border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-lg text-blue-800 group-hover:text-blue-900 transition">{day.dayName} <span className="text-xs text-gray-500">({day.date})</span></span>
                  <button
                    className="ml-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg shadow transition"
                    title="Add meal"
                    onClick={() => setShowAdd({ date: day.date, open: true })}
                  >+</button>
                </div>
                {showAdd.open && showAdd.date === day.date && (
                  <form
                    className="mb-3 flex gap-2"
                    onSubmit={e => { e.preventDefault(); handleAddMeal(day.date); }}
                  >
                    <input
                      type="text"
                      placeholder="Dish name"
                      value={newDish}
                      onChange={e => setNewDish(e.target.value)}
                      className="flex-1 p-2 border-2 border-blue-200 rounded-lg focus:border-blue-400 outline-none transition"
                      required
                    />
                    <select
                      className="p-2 border-2 border-blue-200 rounded-lg focus:border-blue-400 outline-none transition"
                      value={newDish}
                      onChange={e => setNewDish(e.target.value)}
                    >
                      <option value="">Select saved dish...</option>
                      {getUserDishes().map(dish => (
                        <option key={dish} value={dish}>{dish}</option>
                      ))}
                    </select>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition">Add</button>
                    <button type="button" className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg font-semibold transition" onClick={() => setShowAdd({ date: "", open: false })}>Cancel</button>
                  </form>
                )}
                {day.meals.length === 0 ? (
                  <div className="text-gray-400 italic">No meals planned.</div>
                ) : (
                  <ul className="space-y-2">
                    {day.meals.map((m: Meal) => (
                      <li key={m.id} className={`flex items-center gap-3 rounded-lg px-3 py-2 shadow-sm hover:opacity-90 transition`}>
                        <span
                          className="font-semibold cursor-pointer"
                          onClick={() => {
                            if (user && m.username === user.username) {
                              setEditingMealId(m.id);
                              setEditingDish(m.dish);
                            }
                          }}
                        >{m.dish}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getUserColor(m.username)}`}>{getDisplayName(m.username)}</span>
                        {user && m.username === user.username && editingMealId === m.id ? (
                          <form
                            className="flex-1 flex gap-2"
                            onSubmit={e => {
                              e.preventDefault();
                              handleEditMeal(m.id, editingDish);
                            }}
                          >
                            <input
                              type="text"
                              value={editingDish}
                              onChange={e => setEditingDish(e.target.value)}
                              className="flex-1 p-1 border rounded"
                              autoFocus
                            />
                            <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded">Save</button>
                            <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => { setEditingMealId(null); setEditingDish(""); }}>Cancel</button>
                          </form>
                        ) : null}
                        {user && (m.username === user.username || user.role === 'admin') && editingMealId !== m.id && (
                          <button
                            className="ml-auto px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-lg shadow transition"
                            title="Delete meal"
                            onClick={() => handleDeleteMeal(m.id)}
                          >-</button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {message && showAdd.date === day.date && <div className="text-blue-600 text-xs mt-2">{message}</div>}
              </div>
            ))}
          </div>
        </div>
      );
}
// Removed stray bracket
export default function WeeklyMealsPage() {
  return (
    <Suspense>
      <WeeklyMealsContent />
    </Suspense>
  );
}
