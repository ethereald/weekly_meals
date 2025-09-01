import { NextResponse } from 'next/server';
import { changePassword } from '@/lib/users';

export async function POST(request: Request) {
  const { email, oldPassword, newPassword } = await request.json();
  const success = changePassword(email, oldPassword, newPassword);
  if (success) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'Invalid credentials or password' }, { status: 401 });
}
