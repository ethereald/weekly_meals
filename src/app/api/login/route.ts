import { NextResponse } from 'next/server';
import { validateUser } from '@/lib/users';

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const user = validateUser(username, password);
  if (user) {
    // Return all user fields except password
    const { password, ...userData } = user;
    return NextResponse.json({ success: true, user: userData });
  }
  return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}
