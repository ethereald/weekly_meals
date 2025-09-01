export function updateUserColor(username: string, color: string): boolean {
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    user.color = color;
    writeUsers(users);
    return true;
  }
  return false;
}
import fs from 'fs';
import path from 'path';

export type User = {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
  displayName?: string;
  color?: string;
  weekStart?: string;
};

export function updateUserWeekStart(username: string, weekStart: string): boolean {
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    user.weekStart = weekStart;
    writeUsers(users);
    return true;
  }
  return false;
}

const USERS_PATH = path.join(process.cwd(), 'src', 'lib', 'users.json');

function readUsers(): User[] {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
}

function writeUsers(users: User[]) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

export function findUser(username: string): User | undefined {
  return readUsers().find(u => u.username === username);
}

export function updateDisplayName(username: string, displayName: string): boolean {
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    user.displayName = displayName;
    writeUsers(users);
    return true;
  }
  return false;
}

export function validateUser(username: string, password: string): User | null {
  const user = findUser(username);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

export function changePassword(username: string, oldPasswordOrNewPassword: string, newPassword?: string): boolean {
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) return false;
  if (newPassword !== undefined) {
    // Old API: require old password
    if (user.password === oldPasswordOrNewPassword) {
      user.password = newPassword;
      writeUsers(users);
      return true;
    }
    return false;
  } else {
    // New API: just set new password
    user.password = oldPasswordOrNewPassword;
    writeUsers(users);
    return true;
  }
}

export function createUser(username: string, password: string, role: 'admin' | 'user', displayName?: string): User | null {
  const users = readUsers();
  if (users.find(u => u.username === username)) return null;
  // Assign a color from the palette based on user count
  const userColors = [
    "bg-blue-400 text-white",
    "bg-green-500 text-white",
    "bg-yellow-500 text-white",
    "bg-pink-500 text-white",
    "bg-purple-500 text-white",
    "bg-orange-500 text-white",
    "bg-teal-500 text-white",
    "bg-red-500 text-white",
    "bg-indigo-500 text-white",
    "bg-cyan-500 text-white",
  ];
  const color = userColors[users.length % userColors.length];
  const newUser: User = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    password,
    role,
    displayName: displayName || username,
    color,
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}

export function deleteUser(id: number): boolean {
  let users = readUsers();
  const initialLength = users.length;
  const deletedUser = users.find(u => u.id === id);
  users = users.filter(u => u.id !== id);
  writeUsers(users);
  // Also delete all dishes for this user from meals.json
  if (deletedUser) {
    const fs = require('fs');
    const path = require('path');
    const MEALS_PATH = path.join(process.cwd(), 'src', 'lib', 'meals.json');
    if (fs.existsSync(MEALS_PATH)) {
      const meals = JSON.parse(fs.readFileSync(MEALS_PATH, 'utf-8'));
      const filteredMeals = meals.filter((m: any) => m.username !== deletedUser.username);
      fs.writeFileSync(MEALS_PATH, JSON.stringify(filteredMeals, null, 2));
    }
  }
  return users.length < initialLength;
}

export function getAllUsers(): User[] {
  return readUsers();
}
