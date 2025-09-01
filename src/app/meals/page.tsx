"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MealsPage() {
  // Helper: get unique dishes for current user
  function getUserDishes() {
    if (!user) return [];
    const userMeals = meals.filter((m: any) => m.username === user.username);
    const dishSet = new Set<string>();
    userMeals.forEach((m: any) => dishSet.add(m.dish));
    return Array.from(dishSet);
  }
  const router = useRouter();
  type AppUser = { username: string; displayName?: string };
  const [user, setUser] = useState<AppUser | null>(null);
  const [editingMealId, setEditingMealId] = useState<number | null>(null);
  const [editingDish, setEditingDish] = useState<string>("");
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
  const [date, setDate] = useState("");
  const [dish, setDish] = useState("");
  const [message, setMessage] = useState("");

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

  async function handleAddMeal(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!user) return;
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, username: user.username, dish }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Meal added.");
      setDate("");
      setDish("");
      fetchMeals();
    } else {
      setMessage(data.error || "Add meal failed.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-xl text-gray-900">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight">Meal Planning Calendar</h2>
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
      <form onSubmit={handleAddMeal} className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Dish"
            value={dish}
            onChange={e => setDish(e.target.value)}
            className="flex-1 p-2 border rounded"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
        </div>
        {message && <div className="mb-2 text-blue-600">{message}</div>}
      </form>
      <table className="w-full border">
        {/* Unique dish list for current user */}
        <div className="grid grid-cols-1 gap-6">
          {getUserDishes().map((dishName, idx) => {
            // Count how many times this dish is cooked for the current user
            const dishCount = user ? meals.filter((m: any) => m.username === user.username && m.dish === dishName).length : 0;
            return (
              <div key={dishName} className="rounded-2xl bg-white shadow-lg p-6 relative group hover:shadow-2xl transition-all border border-blue-100 flex flex-col gap-2">
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    {editingMealId === idx ? (
                      <form
                        className="flex gap-2"
                        onSubmit={async e => {
                          e.preventDefault();
                          setMessage("");
                          // Update all meals for this user and dish
                          if (!user) return;
                          const userMeals: any[] = meals.filter((m: any) => m.username === user.username && m.dish === dishName);
                          let success = true;
                          for (const m of userMeals) {
                            const res = await fetch("/api/meals", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: m.id, dish: editingDish }),
                            });
                            const data = await res.json();
                            if (!data.success) success = false;
                          }
                          if (success) {
                            setMessage("Dish updated for all dates.");
                            setEditingMealId(null);
                            setEditingDish("");
                            fetchMeals();
                          } else {
                            setMessage("Edit failed for one or more entries.");
                          }
                        }}
                      >
                        <input
                          type="text"
                          value={editingDish}
                          onChange={e => setEditingDish(e.target.value)}
                          className="p-1 border rounded"
                          autoFocus
                        />
                        <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded">Save</button>
                        <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => { setEditingMealId(null); setEditingDish(""); }}>Cancel</button>
                      </form>
                    ) : (
                      <span
                        className="font-semibold cursor-pointer"
                        onClick={() => { setEditingMealId(idx); setEditingDish(dishName); }}
                      >{dishName}</span>
                    )}
                  </div>
                  <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold" title="Times cooked">{dishCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </table>
    </div>
  );
}
