import type { RaidKey } from "./raid-names.ts";
import { getWotlkItemLevel } from "./wotlk-item-levels.ts";
import { createLazyJsonLoader } from "./lazy-json.ts";

type RaidLootSlotData = {
  items: number[];
};

type RaidLootEntry = {
  slots: Record<string, RaidLootSlotData>;
};

let raidLootByKey: Record<string, RaidLootEntry> = {};

export const ensureRaidLootLoaded = createLazyJsonLoader(
  () => import("./raid-loot-by-key.json"),
  (data) => {
    raidLootByKey = data as Record<RaidKey, RaidLootEntry>;
  },
);

export function getRaidLootItemIds(
  raidKey: RaidKey,
  gearSlot: number,
): readonly number[] {
  return raidLootByKey[raidKey]?.slots[String(gearSlot)]?.items ?? [];
}

export function raidHasSlotLoot(raidKey: RaidKey, gearSlot: number): boolean {
  return getRaidLootItemIds(raidKey, gearSlot).length > 0;
}

export function getRaidLootItemIdsForTier(
  raidKey: RaidKey,
  gearSlot: number,
  dungeonItemLevels: readonly number[],
): number[] {
  if (dungeonItemLevels.length === 0) {
    return [];
  }

  const minItemLevel = Math.min(...dungeonItemLevels);
  const maxItemLevel = Math.max(...dungeonItemLevels);

  return getRaidLootItemIds(raidKey, gearSlot).filter((itemId) => {
    const itemLevel = getWotlkItemLevel(itemId);
    return (
      itemLevel !== undefined &&
      itemLevel >= minItemLevel &&
      itemLevel <= maxItemLevel
    );
  });
}

export function getBestRaidLootItemLevelForSlot(
  raidKey: RaidKey,
  gearSlot: number,
  dungeonItemLevels: readonly number[],
): number | undefined {
  const itemLevels = getRaidLootItemIdsForTier(
    raidKey,
    gearSlot,
    dungeonItemLevels,
  )
    .map((itemId) => getWotlkItemLevel(itemId))
    .filter((itemLevel): itemLevel is number => itemLevel !== undefined);

  if (itemLevels.length === 0) {
    return undefined;
  }

  return Math.max(...itemLevels);
}

export function getBestRaidLootItemIdForSlot(
  raidKey: RaidKey,
  gearSlot: number,
  dungeonItemLevels: readonly number[],
): number | undefined {
  const tierItemIds = getRaidLootItemIdsForTier(
    raidKey,
    gearSlot,
    dungeonItemLevels,
  );
  let bestItemId: number | undefined;
  let bestItemLevel = -1;

  for (const itemId of tierItemIds) {
    const itemLevel = getWotlkItemLevel(itemId);
    if (itemLevel !== undefined && itemLevel > bestItemLevel) {
      bestItemLevel = itemLevel;
      bestItemId = itemId;
    }
  }

  return bestItemId;
}
