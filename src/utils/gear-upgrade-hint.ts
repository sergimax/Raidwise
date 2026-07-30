import type { TranslateFn } from "../i18n/translate.ts";
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
import type { BisSlotMap } from "./bis-lists.ts";
import {
  type CharacterEquipContext,
  filterUsableLootItemIds,
} from "./item-equip-restrictions.ts";
import { filterRaidLootItemIdsForDungeon } from "./item-drop-sources.ts";
import { resolveDungeonRaidKey } from "./resolve-dungeon-raid-key.ts";

export type GearUpgradeHintLevel = 0 | 1 | 2 | 3;

export type GearUpgradeSlotHint = {
  slot: number;
  bestLootItemId?: number;
  bestLootItemLevel?: number;
};

export type GearUpgradeHintTrack = {
  level: GearUpgradeHintLevel;
  upgradeSlotCount: number;
  upgradeSlots: GearUpgradeSlotHint[];
};

export type GearUpgradeHint = {
  /** Exact BiS-list item ids missing as upgrades in this dungeon (tier 1). */
  bis: GearUpgradeHintTrack;
  /** Normal name variants of BiS items missing as upgrades (tier 2). */
  bisVariant: GearUpgradeHintTrack;
  /** Spec-relevant ilvl raid loot excluding BiS targets (tier 3). */
  ilvl: GearUpgradeHintTrack;
  equippedCount: number;
  peakDungeonItemLevel: number;
  slotAware: boolean;
  bisListActive: boolean;
};

export type GearHintCellDisplay = {
  kind: "bis" | "ilvl";
  level: GearUpgradeHintLevel;
};

const EMPTY_HINT_TRACK: GearUpgradeHintTrack = {
  level: 0,
  upgradeSlotCount: 0,
  upgradeSlots: [],
};

/** Peak ilvl offered by a dungeon row (highest tier drop). */
export function getDungeonPeakItemLevel(itemLevels: readonly number[]): number {
  if (itemLevels.length === 0) {
    return 0;
  }
  return Math.max(...itemLevels);
}

function upgradeHintLevelFromRatio(ratio: number): GearUpgradeHintLevel {
  if (ratio <= 0) {
    return 0;
  }
  if (ratio <= 0.25) {
    return 1;
  }
  if (ratio <= 0.5) {
    return 2;
  }
  return 3;
}

function isSlotUpgradeableNaive(
  itemLevel: number | undefined,
  peakDungeonItemLevel: number,
): boolean {
  return itemLevel === undefined || itemLevel < peakDungeonItemLevel;
}

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

type GearUpgradeDungeon = Pick<
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
function evaluateSlotTracks(
  item: CharacterGearItem,
  dungeon: GearUpgradeDungeon,
  raidKey: NonNullable<ReturnType<typeof resolveDungeonRaidKey>>,
  equipContext: CharacterEquipContext,
  gearItems: readonly CharacterGearItem[],
  alsoOwnedItemIds: readonly number[],
  bisItemIdsForSlot: readonly number[] | undefined,
  evaluateBisTracks: boolean,
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

function buildHintTrack(
  upgradeSlots: GearUpgradeSlotHint[],
  equippedCount: number,
): GearUpgradeHintTrack {
  const level =
    equippedCount === 0
      ? 0
      : upgradeHintLevelFromRatio(upgradeSlots.length / equippedCount);

  return {
    level,
    upgradeSlotCount: upgradeSlots.length,
    upgradeSlots,
  };
}

function evaluateNaiveIlvlTrack(
  gearItems: readonly CharacterGearItem[],
  peakDungeonItemLevel: number,
): GearUpgradeHintTrack {
  const upgradeSlots: GearUpgradeSlotHint[] = [];

  for (const item of gearItems) {
    const itemLevel = getWotlkItemLevel(item.id);
    if (isSlotUpgradeableNaive(itemLevel, peakDungeonItemLevel)) {
      upgradeSlots.push({ slot: item.slot, bestLootItemLevel: peakDungeonItemLevel });
    }
  }

  return buildHintTrack(upgradeSlots, gearItems.length);
}

function emptyGearUpgradeHint(
  equippedCount: number,
  peakDungeonItemLevel: number,
  slotAware: boolean,
  bisListActive: boolean,
): GearUpgradeHint {
  return {
    bis: EMPTY_HINT_TRACK,
    bisVariant: EMPTY_HINT_TRACK,
    ilvl: EMPTY_HINT_TRACK,
    equippedCount,
    peakDungeonItemLevel,
    slotAware,
    bisListActive,
  };
}

export function evaluateGearUpgradeHint(
  gearItems: readonly CharacterGearItem[] | undefined,
  dungeon: GearUpgradeDungeon,
  bisSlotMap?: BisSlotMap,
  equipContext: CharacterEquipContext = {},
  alsoOwnedItemIds: readonly number[] = [],
): GearUpgradeHint {
  const dungeonItemLevels = dungeon.itemLevel;
  const peakDungeonItemLevel = getDungeonPeakItemLevel(dungeonItemLevels);
  const equippedCount = gearItems?.length ?? 0;
  const bisListActive = bisSlotMap !== undefined && bisSlotMap.size > 0;

  if (equippedCount === 0 || peakDungeonItemLevel === 0 || !gearItems) {
    return emptyGearUpgradeHint(
      equippedCount,
      peakDungeonItemLevel,
      false,
      bisListActive,
    );
  }

  const raidKey = resolveDungeonRaidKey(dungeon);
  if (raidKey) {
    const exactBisSlots: GearUpgradeSlotHint[] = [];
    const variantBisSlots: GearUpgradeSlotHint[] = [];
    const ilvlSlots: GearUpgradeSlotHint[] = [];

    for (const item of gearItems) {
      const bisItemIdsForSlot = bisListActive
        ? bisSlotMap?.get(item.slot)
        : undefined;
      const slotTracks = evaluateSlotTracks(
        item,
        dungeon,
        raidKey,
        equipContext,
        gearItems,
        alsoOwnedItemIds,
        bisItemIdsForSlot,
        bisListActive,
      );

      if (slotTracks.exactBis) {
        exactBisSlots.push(slotTracks.exactBis);
      }
      if (slotTracks.variantBis) {
        variantBisSlots.push(slotTracks.variantBis);
      }
      if (slotTracks.ilvl) {
        ilvlSlots.push(slotTracks.ilvl);
      }
    }

    return {
      bis: bisListActive
        ? buildHintTrack(exactBisSlots, equippedCount)
        : EMPTY_HINT_TRACK,
      bisVariant: bisListActive
        ? buildHintTrack(variantBisSlots, equippedCount)
        : EMPTY_HINT_TRACK,
      ilvl: buildHintTrack(ilvlSlots, equippedCount),
      equippedCount,
      peakDungeonItemLevel,
      slotAware: true,
      bisListActive,
    };
  }

  return {
    bis: EMPTY_HINT_TRACK,
    bisVariant: EMPTY_HINT_TRACK,
    ilvl: evaluateNaiveIlvlTrack(gearItems, peakDungeonItemLevel),
    equippedCount,
    peakDungeonItemLevel,
    slotAware: false,
    bisListActive,
  };
}

/** Cell tint kind: BiS targets (exact or normal variant) take priority over ilvl upgrades. */
export function getGearHintCellDisplay(
  hint: GearUpgradeHint,
): GearHintCellDisplay | null {
  const bisLevel = Math.max(hint.bis.level, hint.bisVariant.level) as GearUpgradeHintLevel;

  if (hint.bisListActive && bisLevel > 0) {
    return { kind: "bis", level: bisLevel };
  }
  if (hint.ilvl.level > 0) {
    return { kind: "ilvl", level: hint.ilvl.level };
  }
  return null;
}

export type GearUpgradeHintTooltipOptions = {
  /** Boss-grouped non-BiS ilvl list is shown — omit redundant count line. */
  showIlvlBossLoot?: boolean;
};

function collectMissingLootItemIds(track: GearUpgradeHintTrack): number[] {
  const itemIds: number[] = [];

  for (const slotHint of track.upgradeSlots) {
    if (
      slotHint.bestLootItemId !== undefined &&
      !itemIds.includes(slotHint.bestLootItemId)
    ) {
      itemIds.push(slotHint.bestLootItemId);
    }
  }

  return itemIds;
}

/** Item ids for boss-grouped BiS loot sections (missing upgrades only). */
export function collectMissingBisLootItemIds(hint: GearUpgradeHint): {
  exact: number[];
  variant: number[];
} {
  return {
    exact: collectMissingLootItemIds(hint.bis),
    variant: collectMissingLootItemIds(hint.bisVariant),
  };
}

/** Item ids for boss-grouped non-BiS ilvl upgrade sections (missing upgrades only). */
export function collectMissingIlvlLootItemIds(hint: GearUpgradeHint): number[] {
  return collectMissingLootItemIds(hint.ilvl);
}

export function formatGearUpgradeHintTooltip(
  hint: GearUpgradeHint,
  t: TranslateFn,
  options?: GearUpgradeHintTooltipOptions,
): string {
  if (hint.ilvl.level > 0 && !options?.showIlvlBossLoot) {
    const introKey = hint.slotAware
      ? "gearHint.raidLootUpgrades"
      : "gearHint.belowIlvl";
    return introKey === "gearHint.belowIlvl"
      ? t(introKey, {
          count: hint.ilvl.upgradeSlotCount,
          total: hint.equippedCount,
          ilvl: hint.peakDungeonItemLevel,
        })
      : t(introKey, { count: hint.ilvl.upgradeSlotCount });
  }

  return "";
}
