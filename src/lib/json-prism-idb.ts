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
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
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
