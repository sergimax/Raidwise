/** localStorage preference: 1 = hidden, 0 = shown, absent = automatic for empty trackers. */
export const APP_INTRO_DISMISSED_STORAGE_KEY = "raidwise-app-intro-dismissed";

/** Pre-rename key; migrated on load via `getLocalStorageItemMigrating`. */
export const LEGACY_APP_INTRO_DISMISSED_STORAGE_KEY =
  "my-raid-cds-app-intro-dismissed";
