import { expect, it } from "vitest";
import { COT_TOOLTIP_SCRIPT_ID, WOWROAD_TOOLTIP_SCRIPT_ID, WOWROAD_TOOLTIP_CONFIG_SCRIPT_ID } from "../../constants/item-tooltips.ts";
import { ensureItemTooltipsLoaded } from "./index.tsx";

it.each([["en", COT_TOOLTIP_SCRIPT_ID], ["ru", WOWROAD_TOOLTIP_SCRIPT_ID]] as const)(
  "deduplicates %s tooltip requests and retries on error",
  (locale, id) => {
    try {
      ensureItemTooltipsLoaded(locale);
      const first = document.getElementById(id)!;
      ensureItemTooltipsLoaded(locale);
      expect(document.getElementById(id)).toBe(first);
      first.dispatchEvent(new Event("error"));
      expect(document.getElementById(id)).toBeNull();
      ensureItemTooltipsLoaded(locale);
      const second = document.getElementById(id);
      expect(second).not.toBeNull();
      expect(second).not.toBe(first);
    } finally {
      document.getElementById(id)?.remove();
      document.getElementById(WOWROAD_TOOLTIP_CONFIG_SCRIPT_ID)?.remove();
    }
  },
);
