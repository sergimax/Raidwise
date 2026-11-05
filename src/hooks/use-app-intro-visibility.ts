import { useCallback, useMemo, useState } from "react";
import {
  APP_INTRO_DISMISSED_STORAGE_KEY,
  LEGACY_APP_INTRO_DISMISSED_STORAGE_KEY,
} from "../constants/app-intro.ts";
import { getLocalStorageItemMigrating } from "../utils/local-storage-migrate.ts";

function readAppIntroPreference(): boolean | null {
  const value = getLocalStorageItemMigrating(
    APP_INTRO_DISMISSED_STORAGE_KEY,
    LEGACY_APP_INTRO_DISMISSED_STORAGE_KEY,
  );
  return value === "1" ? false : value === "0" ? true : null;
}

function writeAppIntroDismissed(dismissed: boolean) {
  try {
    if (dismissed) {
      localStorage.setItem(APP_INTRO_DISMISSED_STORAGE_KEY, "1");
    } else {
      localStorage.setItem(APP_INTRO_DISMISSED_STORAGE_KEY, "0");
    }
    localStorage.removeItem(LEGACY_APP_INTRO_DISMISSED_STORAGE_KEY);
  } catch {
    // ignore quota / private mode
  }
}

type UseAppIntroVisibilityOptions = {
  /** True when there are no characters and no dungeons. */
  isEmptyTracker: boolean;
};

/**
 * Intro help panel: open by default on an empty tracker unless dismissed;
 * the header info button can show/hide it, including on a populated tracker. An explicit
 * choice is persisted so it survives navigation and reloads.
 */
export function useAppIntroVisibility({
  isEmptyTracker,
}: UseAppIntroVisibilityOptions) {
  const [preference, setPreference] = useState(readAppIntroPreference);
  const visible = preference ?? isEmptyTracker;

  const dismiss = useCallback(() => {
    setPreference(false);
    writeAppIntroDismissed(true);
  }, []);

  const toggle = useCallback(() => {
    setPreference(!visible);
    writeAppIntroDismissed(visible);
  }, [visible]);

  return useMemo(
    () => ({
      visible,
      dismiss,
      toggle,
    }),
    [dismiss, toggle, visible],
  );
}
