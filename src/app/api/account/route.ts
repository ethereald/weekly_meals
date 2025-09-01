import { NextResponse } from 'next/server';
import { updateDisplayName, changePassword } from '@/lib/users';
import { updateUserColor, updateUserWeekStart } from '@/lib/users';

export async function POST(request: Request) {
  const { username, displayName, color, oldPassword, newPassword, weekStart } = await request.json();
  if (weekStart) {
    updateUserWeekStart(username, weekStart);
  }
  if (displayName) {
    updateDisplayName(username, displayName);
  }
  if (color) {
    updateUserColor(username, color);
  }
  if (newPassword) {
    changePassword(username, newPassword);
  }
  return NextResponse.json({ success: true });
}
