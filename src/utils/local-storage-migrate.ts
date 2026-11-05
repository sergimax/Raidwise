/**
 * Read `key`; if missing, copy once from `legacyKey` then remove the legacy entry.
 * Used when renaming localStorage keys (My Raid CDs → Raidwise).
 */
export function getLocalStorageItemMigrating(
  key: string,
  legacyKey: string,
): string | null {
  try {
    const current = localStorage.getItem(key);
    if (current !== null) {
      return current;
    }
    const legacy = localStorage.getItem(legacyKey);
    if (legacy === null) {
      return null;
    }
    try {
      localStorage.setItem(key, legacy);
      localStorage.removeItem(legacyKey);
    } catch {
      // Reading the old value succeeded even if the browser refused the move.
    }
    return legacy;
  } catch {
    return null;
  }
}
