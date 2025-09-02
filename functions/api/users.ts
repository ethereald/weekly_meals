// @ts-nocheck
// Cloudflare Function for /api/users (production)
export const onRequestGet = async ({ env }) => {
  // Get all users
  const results = await env.DB.prepare('SELECT id, username, role, displayName FROM users').all();
  return new Response(JSON.stringify(results.results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestPost = async ({ request, env }) => {
  const body = await request.json();
  const { username, password, role, displayName } = body;
  const stmt = env.DB.prepare('INSERT INTO users (username, password, role, displayName) VALUES (?, ?, ?, ?)').bind(username, password, role, displayName);
  await stmt.run();
  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
