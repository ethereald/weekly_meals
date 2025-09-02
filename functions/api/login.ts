// @ts-nocheck
// Cloudflare Function for /api/login (production)
export const onRequestPost = async ({ request, env }) => {
  const body = await request.json();
  const { username, password } = body;

  // Query D1 for user
  const result = await env.DB.prepare(
    'SELECT id, username, password, role, displayName FROM users WHERE username = ?'
  ).bind(username).first();

  if (!result || result.password !== password) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Success: return user info (omit password)
  const { id, role, displayName } = result;
  return new Response(
    JSON.stringify({ id, username, role, displayName }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
