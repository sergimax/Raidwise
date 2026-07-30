import { getWotlkItemName } from "../data/wotlk-item-names.ts";
import { getLocalizedGearSlotLabel } from "../i18n/localized-domain.ts";
import type { AppLocale } from "../i18n/types.ts";
import type { BisListSlot } from "../types/bis-lists.ts";

export type FormatBisListCopyOptions = {
  slots: readonly BisListSlot[];
  locale: AppLocale;
};

/** Pasteable BiS lines: `Slot: Item` or `Slot: A / B` for alternatives. */
export function formatBisListCopyText(options: FormatBisListCopyOptions): string {
  const lines: string[] = [];

  const orderedSlots = [...options.slots].sort(
    (left, right) => left.slot - right.slot,
  );

  for (const slotEntry of orderedSlots) {
    if (slotEntry.itemIds.length === 0) {
      continue;
    }

    const itemNames = slotEntry.itemIds.map(
      (itemId) =>
        getWotlkItemName(itemId, options.locale) ?? `#${itemId}`,
    );
    const slotLabel = getLocalizedGearSlotLabel(slotEntry.slot, options.locale);
    lines.push(`${slotLabel}: ${itemNames.join(" / ")}`);
  }

  return lines.join("\n");
}
