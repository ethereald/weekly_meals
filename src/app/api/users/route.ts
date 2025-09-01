import { NextResponse } from 'next/server';
import { User, findUser, getAllUsers, createUser } from '@/lib/users';

export async function GET() {
  // Return all users except passwords (include weekStart and other fields)
  return NextResponse.json(getAllUsers().map(({ password, ...u }) => ({ ...u }))); 
}

export async function POST(request: Request) {
  const { username, password, role } = await request.json();
  if (!username || !password || !role) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
  }
  const user = createUser(username, password, role);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User already exists' }, { status: 409 });
  }
  return NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName } });
}
