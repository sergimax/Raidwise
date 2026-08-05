import type { RaidKey } from "./raid-names.ts";
import { DungeonDifficulty, type DungeonSize } from "../types/dungeons.ts";
import { buildItemIdMap } from "./build-item-id-map.ts";
import { createLazyJsonLoader } from "./lazy-json.ts";

/** Compact drop source row from bundled WowSims data (`wotlk-item-drop-sources.json`). */
export type BundledItemDropSourceRow = {
  /** Boss or encounter name. */
  b: string;
  /** Template raid key. */
  k: RaidKey;
  /** Raid size (10 / 25). */
  s: DungeonSize;
  /** `N` = Normal, `H` = Heroic. */
  d: "N" | "H";
};

export type ItemDropSource = {
  bossName: string;
  raidKey: RaidKey;
  size: DungeonSize;
  difficulty: (typeof DungeonDifficulty)[keyof typeof DungeonDifficulty];
};

function toItemDropSource(row: BundledItemDropSourceRow): ItemDropSource {
  return {
    bossName: row.b,
    raidKey: row.k,
    size: row.s,
    difficulty: row.d === "H" ? DungeonDifficulty.HEROIC : DungeonDifficulty.NORMAL,
  };
}

let dropSourcesByItemId = new Map<number, readonly ItemDropSource[]>();

const EMPTY_DROP_SOURCES: readonly ItemDropSource[] = [];

export const ensureItemDropSourcesLoaded = createLazyJsonLoader(
  () => import("./wotlk-item-drop-sources.json"),
  (data) => {
    const bundledRowsByItemId = buildItemIdMap(
      data as Record<string, BundledItemDropSourceRow[]>,
    );
    const next = new Map<number, readonly ItemDropSource[]>();
    for (const [itemId, rows] of bundledRowsByItemId) {
      next.set(
        itemId,
        rows.length > 0 ? rows.map(toItemDropSource) : [],
      );
    }
    dropSourcesByItemId = next;
  },
);

/** Boss / raid drop sources for a bundled item id (empty when unknown or non-raid). */
export function getItemDropSources(itemId: number): readonly ItemDropSource[] {
  return dropSourcesByItemId.get(itemId) ?? EMPTY_DROP_SOURCES;
}
