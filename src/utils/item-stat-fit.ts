import {
  getSpecStatProfile,
  type GsStatKey,
  type GsStatWeights,
  type SpecStatProfile,
} from "../data/spec-stat-priorities.ts";
import { getWotlkItemEquipProps } from "../data/wotlk-item-equip-props.ts";
import { WowSimsItemStat } from "../data/wowsims-item-stat.ts";
import {
  getWotlkItemStats,
  type ItemStatFitContext,
  type WotlkItemStatsSparse,
} from "../data/wotlk-item-stats.ts";

/** WowSims gear slot / item type (mirrors item-equip-restrictions.ts). */
const GearSlotOffHand = 15;
const TrinketGearSlots = new Set([12, 13]);
const ItemTypeWeapon = 13;
const WeaponTypeShield = 7;

/** WowSims armor type (mirrors item-equip-restrictions.ts). */
const ArmorTypeMail = 3;

/** Caster proc trinkets whose static stats mirror physical sticks (no bundled proc data). */
const CasterCritProcTrinketItemIds = new Set([
  50340, // Muradin's Spyglass
  50345, // Muradin's Spyglass (heroic)
  50360, // Phylactery of the Nameless Lich
  50365, // Phylactery of the Nameless Lich (heroic)
  47726, // Talisman of Volatile Power
  47946, // Talisman of Volatile Power (heroic)
]);

const CasterHasteProcTrinketItemIds = new Set([
  50348, // Dislodged Foreign Object
  50353, // Dislodged Foreign Object (heroic)
  54572, // Charred Twilight Scale
  54588, // Charred Twilight Scale (heroic)
]);

const TankOnlyProcTrinketItemIds = new Set([
  40257, // Defender's Code
  45158, // Heart of Iron
  50341, // Unidentifiable Organ
  50344, // Unidentifiable Organ (heroic)
  54571, // Petrified Twilight Scale
  54591, // Petrified Twilight Scale (heroic)
]);

const MeleeOnlyProcTrinketItemIds = new Set([
  50342, // Whispering Fanged Skull
  50343, // Whispering Fanged Skull (heroic)
  50351, // Tiny Abomination in a Jar
  50706, // Tiny Abomination in a Jar (heroic)
]);

const DamageProcTrinketWithoutStatsItemIds = new Set([
  40431, // Fury of the Five Flights
]);

/**
 * Caster DPS damage-proc trinkets that only ship SP (or similar) in bundled stats.
 * Healers should never see these as ilvl upgrades; casters still use them.
 */
const CasterDamageProcTrinketItemIds = new Set([
  47182, // Reign of the Unliving
  47188, // Reign of the Unliving (heroic)
  47316, // Reign of the Dead
  47477, // Reign of the Dead (heroic)
]);

/** Proc trinkets recommended for healers only (bundled stats can look like caster gear). */
const HealerOnlyProcTrinketItemIds = new Set([
  47041, // Solace of the Defeated
  47059, // Solace of the Defeated (heroic)
  47271, // Solace of the Fallen
  47432, // Solace of the Fallen (heroic)
  50354, // Bauble of True Blood
  50726, // Bauble of True Blood (heroic)
  50359, // Althor's Abacus
  50366, // Althor's Abacus (heroic)
  54573, // Glowing Twilight Scale
  54589, // Glowing Twilight Scale (heroic)
]);

type NormalizedGsStats = Partial<Record<GsStatKey, number>>;

type RoleSignature = "TANK" | "HEALER" | "CASTER" | "RANGED" | "MELEE";

const WOWSIMS_INDEX_TO_GS_STAT: Partial<Record<number, GsStatKey>> = {
  [WowSimsItemStat.Strength]: "STR",
  [WowSimsItemStat.Agility]: "AGI",
  [WowSimsItemStat.Stamina]: "STA",
  [WowSimsItemStat.Intellect]: "INT",
  [WowSimsItemStat.Spirit]: "SPI",
  [WowSimsItemStat.SpellPower]: "SP",
  [WowSimsItemStat.MP5]: "MP5",
  [WowSimsItemStat.SpellHit]: "HIT",
  [WowSimsItemStat.SpellCrit]: "CRIT",
  [WowSimsItemStat.SpellHaste]: "HASTE",
  [WowSimsItemStat.AttackPower]: "AP",
  [WowSimsItemStat.MeleeHit]: "HIT",
  [WowSimsItemStat.MeleeCrit]: "CRIT",
  [WowSimsItemStat.MeleeHaste]: "HASTE",
  [WowSimsItemStat.ArmorPenetration]: "ARP",
  [WowSimsItemStat.Expertise]: "EXPERTISE",
  [WowSimsItemStat.RangedAttackPower]: "RAP",
  [WowSimsItemStat.Defense]: "DEFENSE",
  [WowSimsItemStat.Block]: "BLOCK",
  [WowSimsItemStat.BlockValue]: "BLOCKVALUE",
  [WowSimsItemStat.Dodge]: "DODGE",
  [WowSimsItemStat.Parry]: "PARRY",
};

function statValue(stats: NormalizedGsStats, key: GsStatKey): number {
  return stats[key] ?? 0;
}

function normalizeItemStatsToGs(sparse: WotlkItemStatsSparse): NormalizedGsStats {
  const normalized: NormalizedGsStats = {};

  for (const [indexStr, value] of Object.entries(sparse)) {
    if (value <= 0) {
      continue;
    }

    const gsKey = WOWSIMS_INDEX_TO_GS_STAT[Number(indexStr)];
    if (!gsKey) {
      continue;
    }

    normalized[gsKey] = (normalized[gsKey] ?? 0) + value;
  }

  return normalized;
}

/** Cached GS-normalized stats by item id (sparse JSON is immutable at runtime). */
const normalizedGsStatsByItemId = new Map<number, NormalizedGsStats>();

function getNormalizedItemStatsToGs(
  itemId: number,
  sparse: WotlkItemStatsSparse,
): NormalizedGsStats {
  const cached = normalizedGsStatsByItemId.get(itemId);
  if (cached) {
    return cached;
  }

  const normalized = normalizeItemStatsToGs(sparse);
  normalizedGsStatsByItemId.set(itemId, normalized);
  return normalized;
}

/** Mirrors GearScore2 `GS_GetRoleSignatureKind` (stat-only subset). */
function getRoleSignatureKind(stats: NormalizedGsStats): RoleSignature | undefined {
  const hasTank =
    statValue(stats, "DEFENSE") > 0 ||
    statValue(stats, "DODGE") > 0 ||
    statValue(stats, "PARRY") > 0 ||
    statValue(stats, "BLOCK") > 0 ||
    statValue(stats, "BLOCKVALUE") > 0;

  const hasHealer = statValue(stats, "MP5") > 0 || statValue(stats, "SPI") > 0;
  const hasCaster = statValue(stats, "SP") > 0 || statValue(stats, "INT") > 0;
  const hasPhysical =
    statValue(stats, "STR") > 0 ||
    statValue(stats, "AGI") > 0 ||
    statValue(stats, "AP") > 0 ||
    statValue(stats, "RAP") > 0 ||
    statValue(stats, "ARP") > 0 ||
    statValue(stats, "EXPERTISE") > 0;
  const hasRanged = statValue(stats, "RAP") > 0;

  if (hasTank) {
    return "TANK";
  }
  if (hasHealer && hasCaster && !hasPhysical) {
    return "HEALER";
  }
  if (hasCaster && !hasPhysical) {
    return "CASTER";
  }
  if (hasRanged) {
    return "RANGED";
  }
  if (hasPhysical) {
    return "MELEE";
  }

  return undefined;
}

function hasPhysicalPrimaryStats(stats: NormalizedGsStats): boolean {
  return (
    statValue(stats, "STR") > 0 ||
    statValue(stats, "AGI") > 0 ||
    statValue(stats, "AP") > 0 ||
    statValue(stats, "RAP") > 0
  );
}

const CASTER_HEALER_PHYSICAL_KEYS: GsStatKey[] = ["STR", "AGI", "AP", "RAP"];

function hasWeightedStat(profile: SpecStatProfile, key: GsStatKey): boolean {
  if ((profile.pve[key] ?? 0) > 0) {
    return true;
  }
  if (profile.hybridPve && (profile.hybridPve[key] ?? 0) > 0) {
    return true;
  }
  return false;
}

/** Caster/healer specs should not see loot with physical primaries they do not weight. */
function hasUnweightedPhysicalStats(
  stats: NormalizedGsStats,
  profile: SpecStatProfile,
): boolean {
  if (profile.role !== "CASTER" && profile.role !== "HEALER") {
    return false;
  }

  return CASTER_HEALER_PHYSICAL_KEYS.some(
    (key) => statValue(stats, key) > 0 && !hasWeightedStat(profile, key),
  );
}

/** Agility melee specs should not see strength-primary loot (e.g. Feral cat). */
function hasUnweightedStrengthForAgilityMelee(
  stats: NormalizedGsStats,
  profile: SpecStatProfile,
): boolean {
  if (profile.role !== "MELEE" && profile.role !== "RANGED") {
    return false;
  }

  const agilityPrimary =
    hasWeightedStat(profile, "AGI") && !hasWeightedStat(profile, "STR");
  if (!agilityPrimary) {
    return false;
  }

  return statValue(stats, "STR") > 0;
}

/** Plate melee specs do not use intellect mail (Enhancement/Elemental gear). Leather may still BiS. */
function isIntellectMailRejectedForProfile(
  itemId: number,
  stats: NormalizedGsStats,
  profile: SpecStatProfile,
): boolean {
  if (profile.role !== "MELEE" && profile.role !== "RANGED") {
    return false;
  }
  if (profile.hybridCasterItems || hasWeightedStat(profile, "INT")) {
    return false;
  }
  if (statValue(stats, "INT") <= 0) {
    return false;
  }

  const item = getWotlkItemEquipProps(itemId);
  return (item?.a ?? 0) === ArmorTypeMail;
}

/** Mirrors GearScore2 `GS_IsItemCompatible` stat/role checks (no slot/armor metadata). */
function isItemStatCompatible(stats: NormalizedGsStats, profile: SpecStatProfile): boolean {
  const role = profile.role;
  const allowHybridCasterItems = profile.hybridCasterItems === true;
  const roleSignature = getRoleSignatureKind(stats);

  if (
    (role === "CASTER" || role === "HEALER") &&
    statValue(stats, "STR") > 0 &&
    statValue(stats, "SP") === 0 &&
    statValue(stats, "INT") === 0
  ) {
    return false;
  }

  if (
    (role === "MELEE" || role === "RANGED") &&
    statValue(stats, "SP") > 0 &&
    !hasPhysicalPrimaryStats(stats) &&
    !allowHybridCasterItems
  ) {
    return false;
  }

  if (role === "TANK" && (roleSignature === "CASTER" || roleSignature === "HEALER")) {
    return false;
  }

  if (
    (role === "MELEE" || role === "RANGED") &&
    roleSignature === "TANK"
  ) {
    return false;
  }

  if (
    (role === "CASTER" || role === "HEALER") &&
    (roleSignature === "MELEE" || roleSignature === "RANGED") &&
    statValue(stats, "SP") === 0 &&
    statValue(stats, "INT") === 0
  ) {
    return false;
  }

  if (
    (role === "MELEE" || role === "RANGED") &&
    (roleSignature === "CASTER" || roleSignature === "HEALER") &&
    !hasPhysicalPrimaryStats(stats) &&
    !allowHybridCasterItems
  ) {
    return false;
  }

  return true;
}

function scoreItemStats(stats: NormalizedGsStats, weights: GsStatWeights): number {
  let total = 0;

  for (const [statKey, weight] of Object.entries(weights) as [GsStatKey, number][]) {
    const value = statValue(stats, statKey);
    if (value > 0) {
      total += value * weight;
    }
  }

  return total;
}

function hasTankAvoidanceStats(stats: NormalizedGsStats): boolean {
  return (
    statValue(stats, "DEFENSE") > 0 ||
    statValue(stats, "DODGE") > 0 ||
    statValue(stats, "PARRY") > 0
  );
}

function hasOnlyStaminaStats(stats: NormalizedGsStats): boolean {
  let hasStamina = false;

  for (const [statKey, value] of Object.entries(stats) as [GsStatKey, number][]) {
    if (value <= 0) {
      continue;
    }
    if (statKey === "STA") {
      hasStamina = true;
      continue;
    }
    return false;
  }

  return hasStamina;
}

function hasOnlyHasteStats(stats: NormalizedGsStats): boolean {
  let hasHaste = false;

  for (const [statKey, value] of Object.entries(stats) as [GsStatKey, number][]) {
    if (value <= 0) {
      continue;
    }
    if (statKey === "HASTE") {
      hasHaste = true;
      continue;
    }
    return false;
  }

  return hasHaste;
}

function isRejectedProcTrinketForProfile(
  itemId: number,
  profile: SpecStatProfile,
  gearSlot: number | undefined,
): boolean {
  if (gearSlot === undefined || !TrinketGearSlots.has(gearSlot)) {
    return false;
  }

  if (TankOnlyProcTrinketItemIds.has(itemId) && profile.role !== "TANK") {
    return true;
  }

  if (HealerOnlyProcTrinketItemIds.has(itemId) && profile.role !== "HEALER") {
    return true;
  }

  if (MeleeOnlyProcTrinketItemIds.has(itemId) && profile.role !== "MELEE") {
    return true;
  }

  if (
    profile.role === "HEALER" &&
    CasterDamageProcTrinketItemIds.has(itemId)
  ) {
    return true;
  }

  if (profile.role === "HEALER" || profile.role === "CASTER") {
    return (
      CasterHasteProcTrinketItemIds.has(itemId) ||
      CasterCritProcTrinketItemIds.has(itemId) ||
      DamageProcTrinketWithoutStatsItemIds.has(itemId)
    );
  }

  if (
    (profile.role === "MELEE" || profile.role === "RANGED") &&
    !profile.hybridCasterItems
  ) {
    return (
      CasterHasteProcTrinketItemIds.has(itemId) ||
      CasterCritProcTrinketItemIds.has(itemId)
    );
  }

  return false;
}

function isRoleNeutralItem(stats: NormalizedGsStats): boolean {
  return getRoleSignatureKind(stats) === undefined;
}

/**
 * Returns whether bundled item stats look useful for the spec.
 * Uses GearScore2-inspired compatibility rules plus weighted PvE stat scoring.
 */
export function isItemStatUsableForSpec(
  itemId: number,
  context: ItemStatFitContext,
  gearSlot?: number,
): boolean {
  const { className, spec } = context;
  if (!className || !spec) {
    return true;
  }

  const profile = getSpecStatProfile(className, spec);
  if (!profile) {
    return true;
  }

  if (
    profile.offHandShieldOnly === true &&
    gearSlot === GearSlotOffHand
  ) {
    const item = getWotlkItemEquipProps(itemId);
    if (item?.t === ItemTypeWeapon && item.w !== WeaponTypeShield) {
      return false;
    }
  }

  const sparseStats = getWotlkItemStats(itemId);
  if (!sparseStats) {
    if (profile.requireTankAvoidanceStats === true) {
      return false;
    }
    if (profile.role === "HEALER" || profile.role === "CASTER") {
      return false;
    }
    return true;
  }

  if (isRejectedProcTrinketForProfile(itemId, profile, gearSlot)) {
    return false;
  }

  if (
    gearSlot !== undefined &&
    TrinketGearSlots.has(gearSlot)
  ) {
    if (profile.role === "TANK" && TankOnlyProcTrinketItemIds.has(itemId)) {
      return true;
    }
    if (profile.role === "HEALER" && HealerOnlyProcTrinketItemIds.has(itemId)) {
      return true;
    }
    if (profile.role === "MELEE" && MeleeOnlyProcTrinketItemIds.has(itemId)) {
      return true;
    }
  }

  const stats = getNormalizedItemStatsToGs(itemId, sparseStats);

  if (
    gearSlot !== undefined &&
    TrinketGearSlots.has(gearSlot) &&
    (profile.role === "MELEE" ||
      profile.role === "RANGED" ||
      profile.role === "HEALER" ||
      profile.role === "CASTER") &&
    hasOnlyStaminaStats(stats)
  ) {
    return false;
  }

  if (
    gearSlot !== undefined &&
    TrinketGearSlots.has(gearSlot) &&
    (profile.role === "MELEE" || profile.role === "RANGED") &&
    !profile.hybridCasterItems &&
    hasOnlyHasteStats(stats)
  ) {
    return false;
  }

  if (profile.rejectSpiritStats === true && statValue(stats, "SPI") > 0) {
    return false;
  }

  if (profile.rejectHitStats === true && statValue(stats, "HIT") > 0) {
    return false;
  }

  if (hasUnweightedPhysicalStats(stats, profile)) {
    return false;
  }

  if (hasUnweightedStrengthForAgilityMelee(stats, profile)) {
    return false;
  }

  if (isIntellectMailRejectedForProfile(itemId, stats, profile)) {
    return false;
  }

  if (!isItemStatCompatible(stats, profile)) {
    return false;
  }

  if (profile.requireTankAvoidanceStats === true && !hasTankAvoidanceStats(stats)) {
    return false;
  }

  if (isRoleNeutralItem(stats)) {
    return true;
  }

  const primaryScore = scoreItemStats(stats, profile.pve);
  if (primaryScore > 0) {
    return true;
  }

  if (profile.hybridPve && scoreItemStats(stats, profile.hybridPve) > 0) {
    return true;
  }

  return false;
}
