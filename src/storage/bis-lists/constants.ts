export const BIS_LISTS_STORAGE_KEY = "raidwise-bis-lists";

/** Pre-rename key, read as a fallback and moved after a successful save. */
export const LEGACY_BIS_LISTS_STORAGE_KEY = "my-raid-cds-bis-lists";
export const BIS_LISTS_STORAGE_KEYS = {
  key: BIS_LISTS_STORAGE_KEY,
  legacyKey: LEGACY_BIS_LISTS_STORAGE_KEY,
};

export const BIS_LISTS_SCHEMA_VERSION = 1 as const;
