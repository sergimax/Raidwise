import { useCallback, useState } from "react";
import {
  GEAR_HINT_LEGEND_DISMISSED_STORAGE_KEY,
  LEGACY_GEAR_HINT_LEGEND_DISMISSED_STORAGE_KEY,
} from "../constants/gear-hint-legend.ts";
import { getLocalStorageItemMigrating } from "../utils/local-storage-migrate.ts";

function readGearHintLegendDismissed(): boolean {
  return (
    getLocalStorageItemMigrating(
      GEAR_HINT_LEGEND_DISMISSED_STORAGE_KEY,
      LEGACY_GEAR_HINT_LEGEND_DISMISSED_STORAGE_KEY,
    ) === "1"
  );
}

export function useGearHintLegendDismissed() {
  const [dismissed, setDismissed] = useState(readGearHintLegendDismissed);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(GEAR_HINT_LEGEND_DISMISSED_STORAGE_KEY, "1");
    } catch {
      // ignore quota / private mode
    }
  }, []);

  return { dismissed, dismiss };
}
