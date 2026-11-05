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

const coreLoads = new Map<ItemTooltipLocale, Promise<void>>();
let hintLoadPromise: Promise<void> | null = null;
let hintDataReady = false;

/** First-paint data: active-locale names + item levels (links / colors). */
export function ensureCoreItemDataLoaded(
  locale: ItemTooltipLocale,
): Promise<void> {
  const cached = coreLoads.get(locale);
  if (cached) return cached;

  const promise = Promise.all([
    ensureItemNamesLoaded(locale),
    ensureWotlkItemLevelsLoaded(),
  ]).then(() => undefined).catch((error: unknown) => {
    coreLoads.delete(locale);
    throw error;
  });

  coreLoads.set(locale, promise);
  return promise;
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
  })().catch((error: unknown) => {
    hintLoadPromise = null;
    throw error;
  });

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
