/** Preferences are optional: storage restrictions must not break the workspace. */
export function readPreference(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function writePreference(key: string, value: string): boolean {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}
export function removePreference(key: string): void {
  try { localStorage.removeItem(key); } catch { /* Optional preference only. */ }
}
