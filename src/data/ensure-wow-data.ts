import type { ItemTooltipLocale } from "../constants/item-tooltips.ts";
import { rebuildBisItemVariantIndex } from "./bis-item-variants.ts";
import { ensureItemDropSourcesLoaded } from "./item-drop-sources.ts";
import { ensureRaidLootLoaded } from "./raid-loot.ts";
import { ensureTierSetsLoaded } from "./tier-sets.ts";
import {
  ensureEnglishItemNamesLoaded,
  ensureItemNamesLoaded,
} from "./wotlk-item-names.ts";
import { ensureWotlkItemEquipPropsLoaded } from "./wotlk-item-equip-props.ts";
import { ensureWotlkItemGearSlotsLoaded } from "./wotlk-item-gear-slots.ts";
import { ensureWotlkItemLevelsLoaded } from "./wotlk-item-levels.ts";
import { ensureWotlkItemStatsLoaded } from "./wotlk-item-stats.ts";

let coreLoadPromise: Promise<void> | null = null;
let coreLocale: ItemTooltipLocale | null = null;
let hintLoadPromise: Promise<void> | null = null;
let hintDataReady = false;

/** First-paint data: active-locale names + item levels (links / colors). */
export function ensureCoreItemDataLoaded(
  locale: ItemTooltipLocale,
): Promise<void> {
  if (coreLoadPromise && coreLocale === locale) {
    return coreLoadPromise;
  }

  coreLocale = locale;
  coreLoadPromise = Promise.all([
    ensureItemNamesLoaded(locale),
    ensureWotlkItemLevelsLoaded(),
  ]).then(() => undefined);

  return coreLoadPromise;
}

/**
 * Gear-hint / BiS / Soft pick payload: stats, equip, drops, tiers, loot,
 * slots, EN names (variants), then rebuilds the N/H variant index.
 */
export function ensureWowHintDataLoaded(): Promise<void> {
  if (hintLoadPromise) {
    return hintLoadPromise;
  }

  hintLoadPromise = (async () => {
    await Promise.all([
      ensureEnglishItemNamesLoaded(),
      ensureWotlkItemLevelsLoaded(),
      ensureWotlkItemGearSlotsLoaded(),
      ensureWotlkItemStatsLoaded(),
      ensureWotlkItemEquipPropsLoaded(),
      ensureItemDropSourcesLoaded(),
      ensureTierSetsLoaded(),
      ensureRaidLootLoaded(),
    ]);
    rebuildBisItemVariantIndex();
    hintDataReady = true;
  })();

  return hintLoadPromise;
}

export function isWowHintDataReady(): boolean {
  return hintDataReady;
}

/** Tests / SSR-style warmup: core locale names + full hint graph. */
export async function ensureAllWowDataLoaded(
  locale: ItemTooltipLocale = "en",
): Promise<void> {
  await Promise.all([
    ensureCoreItemDataLoaded(locale),
    ensureItemNamesLoaded(locale === "en" ? "ru" : "en"),
    ensureWowHintDataLoaded(),
  ]);
}
