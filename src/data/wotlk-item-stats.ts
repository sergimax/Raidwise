import type { ClassName as ClassNameType } from "../types/characters.ts";
import { buildItemIdMap } from "./build-item-id-map.ts";
import { createLazyJsonLoader } from "./lazy-json.ts";
import dataUrl from "./wotlk-item-stats.json?url&no-inline";

/** Sparse WowSims stat index → value for bundled item ids. */
export type WotlkItemStatsSparse = Record<string, number>;

let statsByItemId = new Map<number, WotlkItemStatsSparse>();

export const ensureWotlkItemStatsLoaded = createLazyJsonLoader(
  dataUrl,
  (data) => {
    statsByItemId = buildItemIdMap(
      data as Record<string, WotlkItemStatsSparse>,
    );
  },
);

export function getWotlkItemStats(itemId: number): WotlkItemStatsSparse | undefined {
  return statsByItemId.get(itemId);
}

export function hasItemStat(
  stats: WotlkItemStatsSparse,
  statIndex: number,
): boolean {
  return (stats[String(statIndex)] ?? 0) > 0;
}

export function hasAnyItemStat(
  stats: WotlkItemStatsSparse,
  statIndices: readonly number[],
): boolean {
  return statIndices.some((statIndex) => hasItemStat(stats, statIndex));
}

export type ItemStatFitContext = {
  className?: ClassNameType;
  spec?: string;
};
