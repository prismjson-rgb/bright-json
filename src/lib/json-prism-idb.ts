/**
 * Async IndexedDB key–value store for large app state (tabs JSON, saved buffer, settings).
 * Avoids synchronous localStorage reads/writes that block the main thread on big payloads.
 */

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "bright-json-app";
const DB_VERSION = 1;
const STORE = "kv";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    const opening = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
      terminated() { dbPromise = null; },
      blocking(_current, _blocked, event) { (event.target as IDBDatabase).close(); dbPromise = null; },
    });
    dbPromise = new Promise<IDBPDatabase>((resolve, reject) => {
      let expired = false;
      const timer = setTimeout(() => { expired = true; reject(new Error("Browser storage did not respond.")); }, 5000);
      opening.then((db) => { clearTimeout(timer); if (expired) db.close(); else resolve(db); }, (error) => { clearTimeout(timer); reject(error); });
    }).catch((error) => { dbPromise = null; throw error; });
  }
  return dbPromise;
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  if (typeof window === "undefined") return undefined;
  const db = await getDb();
  return (await db.get(STORE, key)) as T | undefined;
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await getDb();
  await db.put(STORE, value, key);
}

export async function idbDelete(key: string): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await getDb();
  await db.delete(STORE, key);
}
