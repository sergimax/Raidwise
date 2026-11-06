import { generateUUID } from "../uuid.ts";

const LOCK_NAME = "raidwise:save:visibility";
const MARKER_KEY = "raidwise:save-revision";
const RESERVED_MARKER = "00000000-0000-0000-0000-000000000000";
const STORE = "visibility";
const RECEIPT = "latest";

type Commit = (write: () => void) => void;

function openReceipts(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("raidwise-save-coordination", 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readReceipt(db: IDBDatabase): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(RECEIPT);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function writeReceipt(db: IDBDatabase, revision: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
    transaction.objectStore(STORE).put(revision, RECEIPT);
  });
}

/** Web Locks order writers, but localStorage updates can reach renderers later.
 * The IndexedDB receipt identifies the mirror revision a writer must see first.
 */
export function withSaveVisibility<T>(
  locks: LockManager,
  operation: (commit: Commit) => T,
): T | Promise<T> {
  if (typeof indexedDB === "undefined") return operation((write) => write());
  const coordinate = async () => await locks.request(LOCK_NAME, async () => {
    const db = await openReceipts();
    try {
      const receipt = await readReceipt(db);
      if (receipt !== undefined) {
        const deadline = Date.now() + 2000;
        while (localStorage.getItem(MARKER_KEY) !== receipt) {
          if (Date.now() >= deadline) throw new Error("Latest save is not visible in this tab");
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      }

      let committed: string | undefined;
      const result = operation((write) => {
        const revision = generateUUID();
        const reserve = localStorage.getItem(MARKER_KEY) === null;
        // Reserve space for the fixed-length marker before touching the save.
        if (reserve) localStorage.setItem(MARKER_KEY, RESERVED_MARKER);
        try {
          write();
        } catch (error) {
          if (reserve) localStorage.removeItem(MARKER_KEY);
          throw error;
        }
        localStorage.setItem(MARKER_KEY, revision);
        committed = revision;
      });
      if (committed !== undefined) await writeReceipt(db, committed);
      return result;
    } finally {
      db.close();
    }
  });
  return coordinate();
}
