import type { AppLocale } from "../i18n/types.ts";
import type { ClassName, CharacterRecord, CharacterSpecGear } from "../types/characters.ts";
import type { DungeonRecord } from "../types/dungeons.ts";
import type { TierSetHint } from "../types/tier-sets.ts";
import type { GetBisSlotMapForSpec } from "./bis-lists.ts";
import {
  evaluateGearUpgradeHint,
  collectMissingBisLootItemIds,
  collectMissingIlvlLootItemIds,
  type GearUpgradeHint,
} from "./gear-upgrade-hint.ts";
import { evaluateTierSetHint } from "./tier-set-hint.ts";
import {
  groupBisItemIdsByBossForDungeonWithFallback,
  type BossBisLootGroup,
} from "./item-drop-sources.ts";

export type SpecGearHintSide = "main" | "off";

/**
 * Also-owned ids for hint / Soft pick math on one spec: explicit character
 * `alsoOwnedItemIds` plus item ids equipped on the other spec (same character).
 */
export function getEffectiveAlsoOwnedItemIds(
  character: CharacterRecord,
  specSide: SpecGearHintSide,
): number[] {
  const explicitIds = character.alsoOwnedItemIds ?? [];
  const otherSpec =
    specSide === "main" ? character.offSpec : character.mainSpec;
  const otherSpecItemIds =
    otherSpec?.gearItems
      ?.map((item) => item.id)
      .filter((itemId) => itemId > 0) ?? [];

  if (explicitIds.length === 0 && otherSpecItemIds.length === 0) {
    return [];
  }

  return [...new Set([...explicitIds, ...otherSpecItemIds])];
}

export type SpecGearHintCore = {
  specGear: CharacterSpecGear;
  gearHint: GearUpgradeHint;
  /** Evaluated with tint (needed for tooltip eligibility when only tokens apply). */
  tierSetHint: TierSetHint;
};

export type SpecGearHint = SpecGearHintCore & {
  /** Tier 1: exact BiS list items that drop in this raid row. */
  bisBossLootGroups: BossBisLootGroup[];
  /** Tier 2: normal (non-list) name variants of BiS items that drop here. */
  bisVariantBossLootGroups: BossBisLootGroup[];
  /** Tier 3: spec-relevant raid loot upgrades excluding BiS targets. */
  ilvlBossLootGroups: BossBisLootGroup[];
};

export type CharacterGearHintTints = {
  main?: SpecGearHintCore;
  off?: SpecGearHintCore;
};

export type CharacterGearHints = {
  main?: SpecGearHint;
  off?: SpecGearHint;
};

type GearHintDungeon = Pick<
  DungeonRecord,
  "name" | "shortName" | "raidKey" | "itemLevel" | "size" | "difficulty"
>;

/**
 * Cheap per-spec path for table cell tints: upgrade tracks + tier tokens only.
 * Skip boss grouping here — that work belongs in {@link withBossLootGroups}
 * when a tooltip opens or Soft pick builds item lists.
 */
export function evaluateSpecGearHintCore(
  specGear: CharacterSpecGear,
  className: ClassName,
  dungeon: GearHintDungeon,
  getBisSlotMapForSpec: GetBisSlotMapForSpec,
  alsoOwnedItemIds: readonly number[] = [],
): SpecGearHintCore {
  const slotMap = getBisSlotMapForSpec(className, specGear.spec);
  const bisSlotMap = slotMap.size > 0 ? slotMap : undefined;
  const equipContext = { className, spec: specGear.spec };
  const gearHint = evaluateGearUpgradeHint(
    specGear.gearItems,
    dungeon,
    bisSlotMap,
    equipContext,
    alsoOwnedItemIds,
  );

  return {
    specGear,
    gearHint,
    tierSetHint: evaluateTierSetHint(
      specGear.gearItems,
      dungeon,
      bisSlotMap,
      className,
      alsoOwnedItemIds,
    ),
  };
}

/**
 * Enrich a tint core with boss-grouped loot for tooltips / Soft pick.
 * Call only when the UI needs item lists (not on every cell paint).
 */
export function withBossLootGroups(
  core: SpecGearHintCore,
  dungeon: GearHintDungeon,
  locale: AppLocale,
): SpecGearHint {
  const { exact: missingExactBisItemIds, variant: missingVariantBisItemIds } =
    collectMissingBisLootItemIds(core.gearHint);

  const bisBossLootGroups =
    missingExactBisItemIds.length > 0
      ? groupBisItemIdsByBossForDungeonWithFallback(
          missingExactBisItemIds,
          dungeon,
          locale,
        )
      : [];

  const bisVariantBossLootGroups =
    missingVariantBisItemIds.length > 0
      ? groupBisItemIdsByBossForDungeonWithFallback(
          missingVariantBisItemIds,
          dungeon,
          locale,
        )
      : [];

  const missingIlvlLootItemIds = collectMissingIlvlLootItemIds(core.gearHint);
  const ilvlBossLootGroups =
    missingIlvlLootItemIds.length > 0
      ? groupBisItemIdsByBossForDungeonWithFallback(
          missingIlvlLootItemIds,
          dungeon,
          locale,
        )
      : [];

  return {
    ...core,
    bisBossLootGroups,
    bisVariantBossLootGroups,
    ilvlBossLootGroups,
  };
}

/** One spec, full details — Soft pick and any caller that needs boss groups up front. */
export function evaluateSpecGearHint(
  specGear: CharacterSpecGear,
  className: ClassName,
  dungeon: GearHintDungeon,
  getBisSlotMapForSpec: GetBisSlotMapForSpec,
  locale: AppLocale,
  alsoOwnedItemIds: readonly number[] = [],
): SpecGearHint {
  return withBossLootGroups(
    evaluateSpecGearHintCore(
      specGear,
      className,
      dungeon,
      getBisSlotMapForSpec,
      alsoOwnedItemIds,
    ),
    dungeon,
    locale,
  );
}

/** Both specs for one character–dungeon cell (tint only). */
export function evaluateCharacterGearHintTints(
  character: CharacterRecord,
  dungeon: GearHintDungeon,
  getBisSlotMapForSpec: GetBisSlotMapForSpec,
): CharacterGearHintTints {
  const className = character.class?.name;
  if (!className) {
    return {};
  }

  const tints: CharacterGearHintTints = {};

  if (character.mainSpec) {
    tints.main = evaluateSpecGearHintCore(
      character.mainSpec,
      className,
      dungeon,
      getBisSlotMapForSpec,
      getEffectiveAlsoOwnedItemIds(character, "main"),
    );
  }

  if (character.offSpec) {
    tints.off = evaluateSpecGearHintCore(
      character.offSpec,
      className,
      dungeon,
      getBisSlotMapForSpec,
      getEffectiveAlsoOwnedItemIds(character, "off"),
    );
  }

  return tints;
}

/** Lazy tooltip path: reuse tint cores, add boss groups once the tooltip opens. */
export function evaluateCharacterGearHintsFromTints(
  tints: CharacterGearHintTints,
  dungeon: GearHintDungeon,
  locale: AppLocale,
): CharacterGearHints {
  const hints: CharacterGearHints = {};
  if (tints.main) {
    hints.main = withBossLootGroups(tints.main, dungeon, locale);
  }
  if (tints.off) {
    hints.off = withBossLootGroups(tints.off, dungeon, locale);
  }
  return hints;
}

export function evaluateCharacterGearHints(
  character: CharacterRecord,
  dungeon: GearHintDungeon,
  getBisSlotMapForSpec: GetBisSlotMapForSpec,
  locale: AppLocale,
): CharacterGearHints {
  return evaluateCharacterGearHintsFromTints(
    evaluateCharacterGearHintTints(character, dungeon, getBisSlotMapForSpec),
    dungeon,
    locale,
  );
}

function specHintIsActive(
  hint:
    | SpecGearHintCore
    | SpecGearHint
    | undefined,
): boolean {
  if (!hint) {
    return false;
  }

  const hasBossGroups =
    "bisBossLootGroups" in hint &&
    (hint.bisBossLootGroups.length > 0 ||
      hint.bisVariantBossLootGroups.length > 0 ||
      hint.ilvlBossLootGroups.length > 0);

  return (
    hint.gearHint.bis.level > 0 ||
    hint.gearHint.bisVariant.level > 0 ||
    hint.gearHint.ilvl.level > 0 ||
    hint.tierSetHint.tokenNeeds.length > 0 ||
    hasBossGroups
  );
}

export function hasAnyGearHint(
  hints: CharacterGearHints | CharacterGearHintTints,
): boolean {
  return Boolean(specHintIsActive(hints.main) || specHintIsActive(hints.off));
}
