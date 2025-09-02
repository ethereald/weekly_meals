import { getMeals } from '@/lib/meals-data';
import type { Meal } from '@/lib/meals';

export default async function StaticMealsPage() {
  const meals: Meal[] = await getMeals();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Static Meals</h1>
      <ul className="space-y-2">
        {meals.map((meal) => (
          <li key={meal.id} className="border p-4 rounded shadow">
            <div className="font-semibold">{meal.dish}</div>
            <div className="text-gray-600">By: {meal.username} | Date: {meal.date}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
