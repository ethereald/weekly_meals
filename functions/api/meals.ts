// @ts-nocheck
// Cloudflare Function for /api/meals (production)
export const onRequestGet = async ({ env }) => {
  // Get all meals
  const results = await env.DB.prepare('SELECT id, date, username, dish FROM meals').all();
  return new Response(JSON.stringify(results.results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestPost = async ({ request, env }) => {
  const body = await request.json();
  const { date, username, dish } = body;
  const stmt = env.DB.prepare('INSERT INTO meals (date, username, dish) VALUES (?, ?, ?)').bind(date, username, dish);
  await stmt.run();
  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
