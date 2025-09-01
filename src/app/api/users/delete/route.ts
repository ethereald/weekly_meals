import { deleteUser } from '@/lib/users';
import { NextResponse } from 'next/server';
import { users } from '@/lib/users';

export async function POST(request: Request) {
  const { id } = await request.json();
  const success = deleteUser(id);
  if (!success) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
