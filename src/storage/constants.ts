export const STORAGE_KEY = "raidwise";

/** Pre-rename key; migrated on load via `getLocalStorageItemMigrating`. */
export const LEGACY_STORAGE_KEY = "my-raid-cds";

/** Bump when stored JSON shape or migrations change. */
export const CURRENT_SCHEMA_VERSION = 6;

export const LOAD_WARNING_CORRUPTED_SAVE =
  "corrupt-save";
export const LOAD_WARNING_UNSUPPORTED_SAVE = "unsupported-save";
export const STORAGE_CONFLICT = "storage-conflict";
export const STORAGE_READ_FAILED = "storage-read-failed";
