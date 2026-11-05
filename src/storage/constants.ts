export const STORAGE_KEY = "raidwise";

/** Pre-rename key, read as a fallback and moved after a successful save. */
export const LEGACY_STORAGE_KEY = "my-raid-cds";
export const TRACKER_STORAGE_KEYS = { key: STORAGE_KEY, legacyKey: LEGACY_STORAGE_KEY };

/** Bump when stored JSON shape or migrations change. */
export const CURRENT_SCHEMA_VERSION = 6;

export const LOAD_WARNING_CORRUPTED_SAVE =
  "corrupt-save";
export const LOAD_WARNING_UNSUPPORTED_SAVE = "unsupported-save";
export const STORAGE_CONFLICT = "storage-conflict";
export const STORAGE_READ_FAILED = "storage-read-failed";
export const STORAGE_QUOTA_EXCEEDED = "storage-quota-exceeded";
export const STORAGE_WRITE_FAILED = "storage-write-failed";
