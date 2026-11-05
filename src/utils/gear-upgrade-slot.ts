import {
  expandItemIdsWithNameVariantsAtSlot,
  getNonListNameVariantItemIdsAtSlot,
  isItemIdOrNameVariantAtSlot,
  isItemIdOrSameIlvlFactionVariantAtSlot,
} from "../data/bis-item-variants.ts";
import { getRaidLootItemIdsForTier } from "../data/raid-loot.ts";
import { getWotlkItemLevel } from "../data/wotlk-item-levels.ts";
import type { CharacterGearItem } from "../types/character-gear.ts";
import type { DungeonRecord } from "../types/dungeons.ts";
import {
  type CharacterEquipContext,
  filterUsableLootItemIds,
} from "./item-equip-restrictions.ts";
import { filterRaidLootItemIdsForDungeon } from "./item-drop-sources.ts";
import type { resolveDungeonRaidKey } from "./resolve-dungeon-raid-key.ts";

export type GearUpgradeSlotHint = {
  slot: number;
  bestLootItemId?: number;
  bestLootItemLevel?: number;
};

/** Pick highest-ilvl id from already-filtered loot (no second equip/stat pass). */
function pickBestLootItemIdFromFiltered(
  itemIds: readonly number[],
  preferredItemIds?: ReadonlySet<number>,
): number | undefined {
  let bestItemId: number | undefined;
  let bestItemLevel = -1;

  for (const itemId of itemIds) {
    const itemLevel = getWotlkItemLevel(itemId);
    if (itemLevel === undefined) {
      continue;
    }

    const isPreferred = preferredItemIds?.has(itemId) ?? false;
    const bestIsPreferred =
      bestItemId !== undefined && (preferredItemIds?.has(bestItemId) ?? false);

    if (
      itemLevel > bestItemLevel ||
      (itemLevel === bestItemLevel && isPreferred && !bestIsPreferred)
    ) {
      bestItemLevel = itemLevel;
      bestItemId = itemId;
    }
  }

  return bestItemId;
}

function pickBestLootItemLevelFromFiltered(
  itemIds: readonly number[],
): number | undefined {
  let bestItemLevel: number | undefined;

  for (const itemId of itemIds) {
    const itemLevel = getWotlkItemLevel(itemId);
    if (itemLevel === undefined) {
      continue;
    }
    if (bestItemLevel === undefined || itemLevel > bestItemLevel) {
      bestItemLevel = itemLevel;
    }
  }

  return bestItemLevel;
}

export type GearUpgradeDungeon = Pick<
  DungeonRecord,
  "name" | "shortName" | "raidKey" | "itemLevel"
> &
  Partial<Pick<DungeonRecord, "size" | "difficulty">>;

function getRaidLootItemIdsForDungeonRow(
  raidKey: NonNullable<ReturnType<typeof resolveDungeonRaidKey>>,
  gearSlot: number,
  dungeon: GearUpgradeDungeon,
): number[] {
  const tierItemIds = getRaidLootItemIdsForTier(
    raidKey,
    gearSlot,
    dungeon.itemLevel,
  );
  const { size, difficulty } = dungeon;
  if (size === undefined || difficulty === undefined) {
    return tierItemIds;
  }
  return filterRaidLootItemIdsForDungeon(tierItemIds, {
    name: dungeon.name,
    shortName: dungeon.shortName,
    raidKey: dungeon.raidKey,
    size,
    difficulty,
  });
}

/** Finger and trinket slots are interchangeable in-game; BiS lists pin them to slot 1/2 only. */
const SwappableGearSlotGroups: readonly (readonly number[])[] = [
  [10, 11],
  [12, 13],
];

function getSwappableGearSlots(slot: number): readonly number[] {
  for (const group of SwappableGearSlotGroups) {
    if (group.includes(slot)) {
      return group;
    }
  }
  return [slot];
}

function equippedItemsInSwappableGroup(
  gearItems: readonly CharacterGearItem[],
  slot: number,
): CharacterGearItem[] {
  const swappableSlots = getSwappableGearSlots(slot);
  if (swappableSlots.length === 1) {
    return gearItems.filter((item) => item.slot === slot);
  }
  return gearItems.filter((item) => swappableSlots.includes(item.slot));
}

/**
 * Skip loot that is a same-name N/H variant already worn in the ring/trinket pair,
 * or available via also-owned item ids at equal/higher ilvl.
 * Faction twins stay eligible on the ilvl track so the user can pick a faction variant.
 */
function filterLootIdsNotNameVariantOfPossessedAtSlot(
  lootIds: readonly number[],
  gearItems: readonly CharacterGearItem[],
  alsoOwnedItemIds: readonly number[],
  slot: number,
): number[] {
  const equippedInGroup = equippedItemsInSwappableGroup(gearItems, slot);
  const possessedIds = [
    ...equippedInGroup.map((equipped) => equipped.id),
    ...alsoOwnedItemIds,
  ];

  return lootIds.filter((lootId) => {
    const lootItemLevel = getWotlkItemLevel(lootId) ?? 0;

    return !possessedIds.some((possessedId) => {
      if (!isItemIdOrNameVariantAtSlot(lootId, [possessedId], slot)) {
        return false;
      }

      const possessedItemLevel = getWotlkItemLevel(possessedId) ?? 0;
      return possessedItemLevel >= lootItemLevel;
    });
  });
}

function isBisExactTargetSatisfied(
  item: CharacterGearItem,
  bisItemIdsForSlot: readonly number[],
  gearItems: readonly CharacterGearItem[],
  alsoOwnedItemIds: readonly number[],
): boolean {
  const possessedIds = [
    ...equippedItemsInSwappableGroup(gearItems, item.slot).map(
      (equipped) => equipped.id,
    ),
    ...alsoOwnedItemIds,
  ];

  return possessedIds.some((possessedId) =>
    isItemIdOrSameIlvlFactionVariantAtSlot(
      possessedId,
      bisItemIdsForSlot,
      item.slot,
    ),
  );
}

function isBisVariantTargetSatisfied(
  item: CharacterGearItem,
  bisItemIdsForSlot: readonly number[],
  gearItems: readonly CharacterGearItem[],
  alsoOwnedItemIds: readonly number[],
): boolean {
  const nameVariantBisIds = expandItemIdsWithNameVariantsAtSlot(
    bisItemIdsForSlot,
    item.slot,
  );
  const possessedIds = [
    ...equippedItemsInSwappableGroup(gearItems, item.slot).map(
      (equipped) => equipped.id,
    ),
    ...alsoOwnedItemIds,
  ];

  return possessedIds.some(
    (possessedId) =>
      isItemIdOrNameVariantAtSlot(possessedId, bisItemIdsForSlot, item.slot) ||
      isItemIdOrSameIlvlFactionVariantAtSlot(
        possessedId,
        nameVariantBisIds,
        item.slot,
      ),
  );
}

function slotHintFromFilteredLoot(
  slot: number,
  relevantLootIds: readonly number[],
  preferredItemIds?: ReadonlySet<number>,
): GearUpgradeSlotHint | null {
  if (relevantLootIds.length === 0) {
    return null;
  }

  const bestLootItemLevel = pickBestLootItemLevelFromFiltered(relevantLootIds);
  if (bestLootItemLevel === undefined) {
    return null;
  }

  return {
    slot,
    bestLootItemId: pickBestLootItemIdFromFiltered(
      relevantLootIds,
      preferredItemIds,
    ),
    bestLootItemLevel,
  };
}

type SlotTrackHints = {
  exactBis: GearUpgradeSlotHint | null;
  variantBis: GearUpgradeSlotHint | null;
  ilvl: GearUpgradeSlotHint | null;
};

/**
 * One loot fetch + equip filter per slot; branch exact / variant / ilvl from shared ids.
 * Ilvl pays one extra equip+stat filter pass (BiS tracks skip stats).
 */
export function evaluateSlotTracks(
  item: CharacterGearItem,
  dungeon: GearUpgradeDungeon,
  raidKey: NonNullable<ReturnType<typeof resolveDungeonRaidKey>>,
  equipContext: CharacterEquipContext,
  gearItems: readonly CharacterGearItem[],
  alsoOwnedItemIds: readonly number[],
  bisItemIdsForSlot: readonly number[] | undefined,
  evaluateBisTracks: boolean,
  options: { includeIlvl: boolean } = { includeIlvl: true },
): SlotTrackHints {
  const rawLootIds = getRaidLootItemIdsForDungeonRow(raidKey, item.slot, dungeon);

  const expandedBisIds = new Set(
    bisItemIdsForSlot !== undefined
      ? expandItemIdsWithNameVariantsAtSlot(bisItemIdsForSlot, item.slot)
      : [],
  );

  let exactBis: GearUpgradeSlotHint | null = null;
  let variantBis: GearUpgradeSlotHint | null = null;

  if (evaluateBisTracks && bisItemIdsForSlot && bisItemIdsForSlot.length > 0) {
    const equipUsableLootIds = filterUsableLootItemIds(
      rawLootIds,
      item.slot,
      equipContext,
    );
    const exactBisIds = new Set(bisItemIdsForSlot);
    const variantOnlyBisIds = new Set(
      getNonListNameVariantItemIdsAtSlot(bisItemIdsForSlot, item.slot),
    );

    const exactLootIds = equipUsableLootIds.filter((itemId) =>
      exactBisIds.has(itemId),
    );
    if (
      exactLootIds.length > 0 &&
      !isBisExactTargetSatisfied(
        item,
        bisItemIdsForSlot,
        gearItems,
        alsoOwnedItemIds,
      )
    ) {
      exactBis = slotHintFromFilteredLoot(item.slot, exactLootIds, exactBisIds);
    }

    const variantLootIds = equipUsableLootIds.filter((itemId) =>
      variantOnlyBisIds.has(itemId),
    );
    if (
      variantLootIds.length > 0 &&
      !isBisVariantTargetSatisfied(
        item,
        bisItemIdsForSlot,
        gearItems,
        alsoOwnedItemIds,
      )
    ) {
      variantBis = slotHintFromFilteredLoot(
        item.slot,
        variantLootIds,
        variantOnlyBisIds,
      );
    }
  }

  if (!options.includeIlvl) {
    return { exactBis, variantBis, ilvl: null };
  }

  const statUsableLootIds = filterUsableLootItemIds(
    rawLootIds,
    item.slot,
    equipContext,
    { filterBySpecStats: true },
  );
  const ilvlCandidateIds = filterLootIdsNotNameVariantOfPossessedAtSlot(
    statUsableLootIds.filter((itemId) => !expandedBisIds.has(itemId)),
    gearItems,
    alsoOwnedItemIds,
    item.slot,
  );

  let ilvl: GearUpgradeSlotHint | null = null;
  if (ilvlCandidateIds.length > 0) {
    const bestLootItemLevel = pickBestLootItemLevelFromFiltered(ilvlCandidateIds);
    if (bestLootItemLevel !== undefined) {
      const itemLevel = getWotlkItemLevel(item.id);
      if (itemLevel === undefined || itemLevel < bestLootItemLevel) {
        ilvl = {
          slot: item.slot,
          bestLootItemId: pickBestLootItemIdFromFiltered(ilvlCandidateIds),
          bestLootItemLevel,
        };
      }
    }
  }

  return { exactBis, variantBis, ilvl };
}
