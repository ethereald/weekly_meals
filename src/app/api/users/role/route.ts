import { NextResponse } from 'next/server';
import { users } from '@/lib/users';

export async function POST(request: Request) {
  const { id, role } = await request.json();
  const user = users.find(u => u.id === id);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }
  user.role = role;
  return NextResponse.json({ success: true });
}
