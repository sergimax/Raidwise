import type { GsStatKey, GsStatWeights } from "../data/spec-stat-priorities.ts";
import { WowSimsItemStat } from "../data/wowsims-item-stat.ts";
import type { WotlkItemStatsSparse } from "../data/wotlk-item-stats.ts";

export type NormalizedGsStats = Partial<Record<GsStatKey, number>>;

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

export function statValue(stats: NormalizedGsStats, key: GsStatKey): number {
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

export function getNormalizedItemStatsToGs(
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

export function scoreItemStats(stats: NormalizedGsStats, weights: GsStatWeights): number {
  let total = 0;

  for (const [statKey, weight] of Object.entries(weights) as [GsStatKey, number][]) {
    const value = statValue(stats, statKey);
    if (value > 0) {
      total += value * weight;
    }
  }

  return total;
}
