import type { Meal } from './meals';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const MEALS_PATH = path.join(process.cwd(), 'src', 'lib', 'meals.json');

// Use SQL if DATABASE_URL is set, otherwise JSON
let pool: Pool | null = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
}

export async function getMeals(): Promise<Meal[]> {
  if (pool) {
    const result = await pool.query('SELECT id, date, username, dish FROM meals');
    return result.rows;
  }
  if (!fs.existsSync(MEALS_PATH)) return [];
  return JSON.parse(fs.readFileSync(MEALS_PATH, 'utf-8'));
}

export async function addMeal(date: string, username: string, dish: string): Promise<Meal> {
  if (pool) {
    const result = await pool.query(
      'INSERT INTO meals (date, username, dish) VALUES ($1, $2, $3) RETURNING *',
      [date, username, dish]
    );
    return result.rows[0];
  }
  const meals = await getMeals();
  const newMeal: Meal = {
    id: meals.length ? Math.max(...meals.map(m => m.id)) + 1 : 1,
    date,
    username,
    dish,
  };
  meals.push(newMeal);
  fs.writeFileSync(MEALS_PATH, JSON.stringify(meals, null, 2));
  return newMeal;
}

export async function deleteMeal(id: number): Promise<boolean> {
  if (pool) {
    const result = await pool.query('DELETE FROM meals WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
  }
  let meals = await getMeals();
  const initialLength = meals.length;
  meals = meals.filter(m => m.id !== id);
  fs.writeFileSync(MEALS_PATH, JSON.stringify(meals, null, 2));
  return meals.length < initialLength;
}
