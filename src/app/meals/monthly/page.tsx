"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AppUser = { username: string; displayName?: string };
type Meal = { id: string; date: string; dish: string; username: string };

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayBgColors = [
  "bg-blue-50",
  "bg-green-50",
  "bg-yellow-50",
  "bg-pink-50",
  "bg-purple-50",
  "bg-orange-50",
  "bg-teal-50",
];

export default function MonthlyMealsPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM
  });
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
      fetchMeals();
    } else {
      router.replace("/login");
      setLoading(false);
    }
  }, [router]);

  async function fetchMeals() {
    const res = await fetch("/api/meals");
    const data = await res.json();
    setMeals(data);
    setLoading(false);
  }

  function changeMonth(offset: number) {
    const [year, mon] = month.split("-").map(Number);
    let newYear = year;
    let newMonth = mon + offset;
    if (newMonth < 1) { newYear--; newMonth = 12; }
    if (newMonth > 12) { newYear++; newMonth = 1; }
    setMonth(`${newYear.toString().padStart(4, "0")}-${newMonth.toString().padStart(2, "0")}`);
  }

  function getMonthGridRows() {
    const [year, mon] = month.split("-").map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const grid: Array<Array<{ date: string; meals: Meal[] } | null>> = [];
    let week: Array<{ date: string; meals: Meal[] } | null> = Array(7).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${month}-${String(i).padStart(2, "0")}`;
      const d = new Date(dateStr);
      const dayIdx = d.getDay();
      const mealsForDay = meals.filter((m) => m.date === dateStr);
      week[dayIdx] = { date: dateStr, meals: mealsForDay };
      if (dayIdx === 6 || i === daysInMonth) {
        grid.push(week);
        week = Array(7).fill(null);
      }
    }
    return grid;
  }

  function getDayBgColor(dayIdx: number) {
    return dayBgColors[dayIdx % dayBgColors.length];
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-xl text-gray-900">
      <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight mb-4">Monthly Meal Calendar</h2>
      <div className="mb-4 flex gap-2 items-center">
        <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => changeMonth(-1)}>&lt; Prev Month</button>
        <span className="font-semibold">Month: {month}</span>
        <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => changeMonth(1)}>Next Month &gt;</button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-blue-600 font-bold text-xl">Loading...</div>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr>
              {dayNames.map((name) => (
                <th key={name} className="p-2 bg-blue-100 border font-bold">{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getMonthGridRows().map((week, i) => (
              <tr key={i}>
                {week.map((day, j) => (
                  <td key={j} className={`align-middle p-2 border w-[120px] h-[100px] text-center ${getDayBgColor(j)}`}> 
                    {day ? (
                      <div>
                        <div className="font-bold text-blue-900 mb-1">{day.date.split("-")[2]}</div>
                        {day.meals.length === 0 ? (
                          <div className="text-gray-500 text-xs">No meals</div>
                        ) : (
                          day.meals.map((m) => (
                            <div key={m.id} className="mb-1 px-1 py-0.5 rounded bg-blue-200 text-blue-900">
                              <span className="font-semibold">{m.dish}</span>
                              <div className="text-xs text-gray-700">{m.username}</div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
