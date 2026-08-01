import { useCallback, useMemo, useState } from "react";
import { APP_INTRO_DISMISSED_STORAGE_KEY } from "../constants/app-intro.ts";

function readAppIntroDismissed(): boolean {
  try {
    return localStorage.getItem(APP_INTRO_DISMISSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeAppIntroDismissed(dismissed: boolean) {
  try {
    if (dismissed) {
      localStorage.setItem(APP_INTRO_DISMISSED_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(APP_INTRO_DISMISSED_STORAGE_KEY);
    }
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
 * header info toggle can show/hide anytime (including scenario C / BiS-only).
 */
export function useAppIntroVisibility({
  isEmptyTracker,
}: UseAppIntroVisibilityOptions) {
  const [dismissed, setDismissed] = useState(readAppIntroDismissed);
  const [forcedOpen, setForcedOpen] = useState(false);

  const visible = forcedOpen || (isEmptyTracker && !dismissed);

  const dismiss = useCallback(() => {
    setForcedOpen(false);
    setDismissed(true);
    writeAppIntroDismissed(true);
  }, []);

  const toggle = useCallback(() => {
    if (visible) {
      setForcedOpen(false);
      setDismissed(true);
      writeAppIntroDismissed(true);
      return;
    }

    setDismissed(false);
    writeAppIntroDismissed(false);
    setForcedOpen(true);
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
