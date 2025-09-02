import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/users';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const { id, role } = await request.json();
  const users = getAllUsers();
  const user = users.find(u => u.id === id);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }
  user.role = role;
  // Persist change to users.json
  const USERS_PATH = path.join(process.cwd(), 'src', 'lib', 'users.json');
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  return NextResponse.json({ success: true });
}
