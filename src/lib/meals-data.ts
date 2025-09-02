
import type { Meal } from './meals';

// Static config: set to 'json' for local, 'd1' for Cloudflare production
const DATA_SOURCE: 'json' | 'd1' = 'd1';    // Change to 'd1' for Cloudflare
// const DATA_SOURCE: 'json' | 'd1' = 'json';  // Change to 'json' for local

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
  if (DATA_SOURCE === 'd1' && typeof globalThis.env !== 'undefined' && globalThis.env.DB) {
    return await getMealsFromD1();
  }
  return getMealsFromJson();
}
