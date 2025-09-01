export function updateMealOrder(date: string, username: string, orderedIds: number[]): boolean {
  const meals = readMeals();
  // Get all meals for this user and date
  const userMeals = meals.filter(m => m.date === date && m.username === username);
  if (userMeals.length !== orderedIds.length) return false;
  // Sort userMeals by orderedIds
  const sortedMeals = orderedIds.map(id => userMeals.find(m => m.id === id)).filter(Boolean) as Meal[];
  // Remove old userMeals from meals
  const others = meals.filter(m => !(m.date === date && m.username === username));
  // Add sorted userMeals back
  const newMeals = [...others, ...sortedMeals];
  writeMeals(newMeals);
  return true;
}
export function updateMealDish(id: number, dish: string): boolean {
  const meals = readMeals();
  const meal = meals.find(m => m.id === id);
  if (meal) {
    meal.dish = dish;
    writeMeals(meals);
    return true;
  }
  return false;
}
import fs from 'fs';
import path from 'path';

export type Meal = {
  id: number;
  date: string;
  username: string;
  dish: string;
};

const MEALS_PATH = path.join(process.cwd(), 'src', 'lib', 'meals.json');

function readMeals(): Meal[] {
  if (!fs.existsSync(MEALS_PATH)) return [];
  return JSON.parse(fs.readFileSync(MEALS_PATH, 'utf-8'));
}

function writeMeals(meals: Meal[]) {
  fs.writeFileSync(MEALS_PATH, JSON.stringify(meals, null, 2));
}

export function getMeals(): Meal[] {
  return readMeals();
}

export function addMeal(date: string, username: string, dish: string): Meal {
  const meals = readMeals();
  const newMeal: Meal = {
    id: meals.length ? Math.max(...meals.map(m => m.id)) + 1 : 1,
    date,
    username,
    dish,
  };
  meals.push(newMeal);
  writeMeals(meals);
  return newMeal;
}

export function deleteMeal(id: number): boolean {
  let meals = readMeals();
  const initialLength = meals.length;
  meals = meals.filter(m => m.id !== id);
  writeMeals(meals);
  return meals.length < initialLength;
}
