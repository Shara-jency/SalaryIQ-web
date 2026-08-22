/**
 * Trivial UI-level flags only (theme preference, "has bootstrapped").
 * Mirrors the RN app's split between SQLite (structured data, now IndexedDB)
 * and AsyncStorage (one onboarding boolean, now localStorage).
 */

export function getLocalFlag(key: string): string | null {
  return localStorage.getItem(key);
}

export function setLocalFlag(key: string, value: string): void {
  localStorage.setItem(key, value);
}
