import { STORAGE_KEY } from "./constants";
import { defaultState } from "./wardrobe-default";
import type { WardrobeState } from "./types";

export { defaultState };

const DB_NAME = "atelier-wardrobe";
const STORE = "state";

let cloudEnabled: boolean | null = null;

function parseState(raw: string): WardrobeState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<WardrobeState>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : defaultState().items,
      outfits: Array.isArray(parsed.outfits)
        ? parsed.outfits
        : defaultState().outfits,
      calendar: Array.isArray(parsed.calendar) ? parsed.calendar : [],
      settings: {
        displayName: parsed.settings?.displayName ?? "love",
      },
    };
  } catch {
    return null;
  }
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readIndexedDb() {
  const db = await openDb();
  return new Promise<WardrobeState | null>((resolve, reject) => {
    const request = db
      .transaction(STORE, "readonly")
      .objectStore(STORE)
      .get(STORAGE_KEY);
    request.onsuccess = () => {
      const value = request.result;
      resolve(value && typeof value === "object" ? (value as WardrobeState) : null);
    };
    request.onerror = () => reject(request.error);
  });
}

async function writeIndexedDb(state: WardrobeState) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const request = db
      .transaction(STORE, "readwrite")
      .objectStore(STORE)
      .put(state, STORAGE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function loadLocal(): Promise<WardrobeState> {
  try {
    const stored = await readIndexedDb();
    if (stored?.items) return stored;
  } catch {
    // Fall through.
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = parseState(raw);
    return parsed ?? defaultState();
  } catch {
    return defaultState();
  }
}

export async function loadState(): Promise<WardrobeState> {
  if (typeof window === "undefined") return defaultState();
  try {
    const response = await fetch("/api/wardrobe");
    if (response.ok) {
      const payload = (await response.json()) as {
        mode?: string;
        state?: WardrobeState;
      };
      cloudEnabled = payload.mode === "db";
      if (cloudEnabled && payload.state) return payload.state;
    } else {
      cloudEnabled = false;
    }
  } catch {
    cloudEnabled = false;
  }
  return loadLocal();
}

export async function saveState(state: WardrobeState) {
  if (typeof window === "undefined") return;
  if (cloudEnabled) {
    const response = await fetch("/api/wardrobe", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!response.ok) {
      throw new Error("Could not save the wardrobe to the database.");
    }
    return;
  }
  await writeIndexedDb(state);
}
