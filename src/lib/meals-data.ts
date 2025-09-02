
import type { Meal } from './meals';

// Type definitions for Cloudflare D1
declare global {
  // Cloudflare Workers environment bindings
  var env: {
    DB?: {
      prepare: (sql: string) => {
        all: () => Promise<{ results: unknown[] }>
      }
    }
  };
}

// D1 SQL (Cloudflare) access stub
async function getMealsFromD1(): Promise<Meal[]> {
  // Example: Use globalThis.env.DB (Cloudflare D1 binding)
  if (!globalThis.env?.DB) throw new Error('D1 DB binding not found');
  const { results } = await globalThis.env.DB.prepare('SELECT id, date, username, dish FROM meals').all();
  return results as Meal[];
}

// Local JSON access
import mealsJson from './meals.json';

function getMealsFromJson(): Meal[] {
  // Use the local JSON solution
  return mealsJson as Meal[];
}

export async function getMeals(): Promise<Meal[]> {
  if (process.env.USE_D1 === '1') {
    return await getMealsFromD1();
  }
  return getMealsFromJson();
}
