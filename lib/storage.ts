import type { Account, UserData } from "@/types";

const ACCOUNTS_KEY = "homie:accounts";
const SESSION_KEY = "homie:session";
const dataKey = (username: string) => `homie:data:${username}`;

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getAccounts(): Account[] {
  return readLocal<Account[]>(ACCOUNTS_KEY, []);
}

export function saveAccount(account: Account): void {
  const accounts = getAccounts();
  accounts.push(account);
  writeLocal(ACCOUNTS_KEY, accounts);
}

export function findAccount(username: string): Account | undefined {
  return getAccounts().find((a) => a.username === username);
}

export function getSessionUser(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_KEY);
}

export function setSessionUser(username: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, username);
}

export function clearSessionUser(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function getUserData(username: string): UserData {
  return readLocal<UserData>(dataKey(username), {
    properties: [],
    notifications: [],
  });
}

export function saveUserData(username: string, data: UserData): void {
  writeLocal(dataKey(username), data);
}
