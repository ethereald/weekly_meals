  // ...existing code...
"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MonthlyMealsPage() {
  const allDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // Get user's preferred week start from localStorage
  function getUserWeekStart() {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        return u.weekStart || "Monday";
      }
    }
    return "Monday";
  }
  const weekStartName = getUserWeekStart();
  const startIdx = allDayNames.indexOf(weekStartName);
  const dayNames = [...allDayNames.slice(startIdx), ...allDayNames.slice(0, startIdx)];
  // ...existing code...
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
  // Dynamic user map for display name lookup
  const [userMap, setUserMap] = useState<Record<string, { id: number, username: string, displayName: string, color?: string }>>({});
  function getDisplayName(key: string) {
    const user = userMap[key];
    if (!user) {
      // Try to find by username if key is id, or by id if key is username
      const found = Object.values(userMap).find(u => u.username === key || String(u.id) === key);
      return found ? found.displayName : key;
    }
    return user.displayName;
  }
  
  const router = useRouter();
  useEffect(() => {
    fetchUsers();
  }, [router]);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      // Map both username and id to user object
      const map: Record<string, { id: number, username: string, displayName: string }> = {};
      for (const u of data) {
        map[u.username] = u;
        map[String(u.id)] = u;
      }
      setUserMap(map);
      } catch {
        setUserMap({});
    }
  }
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number, y: number } | null>(null);
// Color palette for day backgrounds
const dayBgColors = [
  "bg-blue-50",
  "bg-green-50",
  "bg-yellow-50",
  "bg-pink-50",
  "bg-purple-50",
  "bg-orange-50",
  "bg-teal-50",
];
function getDayBgColor(dayIdx: number) {
  return dayBgColors[dayIdx % dayBgColors.length];
}
// More saturated color palette for users to avoid conflict with cell backgrounds
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
function getUserColor(username: string) {
  // Use id and display name for color mapping for more uniqueness
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
  function changeMonth(offset: number) {
    const [year, mon] = month.split("-");
    let y = Number(year);
    let m = Number(mon) + offset;
    if (m < 1) { y--; m = 12; }
    if (m > 12) { y++; m = 1; }
    setMonth(`${y}-${String(m).padStart(2, "0")}`);
  }
  type AppUser = { username: string; role?: string; displayName?: string };
  const [user, setUser] = useState<AppUser | null>(null);
  const [meals, setMeals] = useState([]);
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
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
    }
  }, [router]);

  async function fetchMeals() {
    const res = await fetch("/api/meals");
    const data = await res.json();
    setMeals(data);
  }

  function getMonthMeals() {
  // Removed unused function 'getMonthMeals'.
  // return meals.filter((m: any) => m.date.startsWith(month));
  }

  // Build grid: days in month, each cell lists meals for that day, show day of week, weeks start on Sunday
    // Removed duplicate allDayNames declaration
  function getMonthGridRows() {
  // Use dayNames from top-level declaration
    const [year, mon] = month.split("-");
    const daysInMonth = new Date(Number(year), Number(mon), 0).getDate();
    const grid = [];
    let week = Array(7).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${month}-${String(i).padStart(2, "0")}`;
      const d = new Date(dateStr);
      // getDay: 0=Sun, 1=Mon, ..., 6=Sat
  const dayIdx = (d.getDay() - startIdx + 7) % 7;
  const mealsForDay = meals.filter((m: { date: string }) => m.date === dateStr);
      week[dayIdx] = { date: dateStr, meals: mealsForDay, dayOfWeek: dayNames[dayIdx] };
      // If last day of week or last day of month, push week and reset
      if (dayIdx === 6 || i === daysInMonth) {
        grid.push(week);
        week = Array(7).fill(null);
      }
    }
    return grid;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-xl text-gray-900">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight">Monthly Meal Grid</h2>
          {user && (
            <div className="mt-1 text-sm text-gray-700">Logged in as <span className="font-semibold text-blue-700">{user.displayName}</span></div>
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
              className="absolute right-0 mt-2 w-48 bg-white border border-blue-200 rounded-lg shadow-lg z-50"
            >
              <a
                href="/account"
                className="block px-4 py-2 hover:bg-blue-50 text-blue-900 font-medium"
                onClick={() => setAccountDropdownOpen(false)}
              >
                Account Management
              </a>
              {user && user.role === 'admin' && (
                <a
                  href="/admin"
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium border-t border-blue-100"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  Admin Panel
                </a>
              )}
              <button
                className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-red-600 font-medium"
                onClick={() => {
                  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }
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
        {user && user.role === 'admin' && (
          <button type="button" className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white font-semibold shadow-md hover:from-gray-800 hover:to-black transition duration-200" onClick={() => window.location.href='/admin'}>Admin Panel</button>
        )}
      </div>
      <div className="mb-4 flex gap-2 items-center">
        <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => changeMonth(-1)}>&lt; Prev</button>
        <label htmlFor="month" className="font-semibold">Month:</label>
        <input
          type="month"
          id="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="p-2 border rounded"
        />
        <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => changeMonth(1)}>Next &gt;</button>
        <button type="button" className="px-3 py-1 bg-blue-200 rounded" onClick={() => setMonth(currentMonth)}>Current Month</button>
      </div>
      <div className="">
        <table className="w-full border text-xs md:text-sm table-fixed">
          <thead>
            <tr className="bg-gray-100">
              {dayNames.map(day => (
                <th key={day} className="p-1 md:p-2 border text-center whitespace-nowrap">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getMonthGridRows().map((week, i) => {
              // Find first non-null day in week for redirect
              const firstDay = week.find(day => day);
              const weekStart = firstDay ? firstDay.date : "";
              return (
                <tr
                  key={i}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => weekStart && router.push(`/meals/weekly?start=${weekStart}`)}
                >
                  {week.map((day, j) => (
                    <td
                      key={j}
                      className={`align-middle p-1 md:p-2 border break-words w-[80px] md:w-[120px] h-[80px] md:h-[120px] text-center ${getDayBgColor(j)}`}
                      onClick={e => {
                        // Only go to weekly view if not clicking a dish
                        if ((e.target as HTMLElement).dataset.dishid) return;
                        if (weekStart) router.push(`/meals/weekly?start=${weekStart}`);
                      }}
                    >
                      {day ? (
                        <div className="flex flex-col justify-center items-center h-full relative">
                          {/* Large background date */}
                          <span
                            className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-gray-400 opacity-40 select-none pointer-events-none"
                            style={{ zIndex: 0 }}
                          >
                            {day.date.split("-")[2]}
                          </span>
                          {/* Top right corner date */}
                          <span
                            className="absolute top-1 right-2 text-xs font-bold text-gray-500 bg-white bg-opacity-60 px-1 rounded z-10 select-none pointer-events-none"
                          >
                            {day.date.split("-")[2]}
                          </span>
                          <div className="relative z-10 w-full">
                            {day.meals.length === 0 ? (
                              <div className="text-gray-500 text-xs">No meals</div>
                            ) : (
                              day.meals.map((m: { id: string; dish: string; username: string }) => (
                                <div
                                  key={m.id}
                                  data-dishid={m.id}
                                  className={`mb-1 relative px-1 py-0.5 rounded ${getUserColor(m.username)} cursor-pointer`}
                                  style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '100%' }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    const id = `${day.date}-${m.id}`;
                                    if (activeTooltip === id) {
                                      setActiveTooltip(null);
                                      setTooltipPos(null);
                                    } else {
                                      setActiveTooltip(id);
                                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                                      setTooltipPos({ x: rect.right + 10, y: rect.top });
                                    }
                                  }}
                                >
                                  <span className="font-semibold overflow-hidden" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '80px' }}>{m.dish.length > 20 ? m.dish.slice(0, 17) + '...' : m.dish}</span>
                                  {/* Tooltip on click: show full dish and user display name, with dark background for contrast */}
                                  {activeTooltip === `${day.date}-${m.id}` && tooltipPos && createPortal(
                                    <div
                                      style={{
                                        position: 'fixed',
                                        left: tooltipPos.x,
                                        top: tooltipPos.y,
                                        minWidth: '120px',
                                        maxWidth: '220px',
                                        padding: '0.5rem',
                                        borderRadius: '0.375rem',
                                        background: '#111827',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
                                        zIndex: 2147483647,
                                        wordBreak: 'break-word',
                                        pointerEvents: 'auto',
                                      }}
                                    >
                                      <span style={{ fontWeight: 'bold' }}>{m.dish}</span><br />
                                      {/* Only show display name, not user id/username */}
                                      <span>{getDisplayName(m.username)}</span>
                                    </div>,
                                    document.body
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
