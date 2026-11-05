import { RaidNames } from "../data/raid-names.ts";
import { getTierSetItemEntry } from "../data/tier-sets.ts";
import type { AppLocale } from "../i18n/types.ts";
import type { TranslateFn } from "../i18n/translate.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";
import { formatDungeonExportLabel } from "./format-dungeon-label.ts";
import { getFormattedItemDropSources } from "./item-drop-sources.ts";

/** Display-only acquisition labels for the BiS editor; raid loot matching stays separate. */
export function getBisItemSourceText(itemId: number, locale: AppLocale, t: TranslateFn): string {
  const tierPiece = getTierSetItemEntry(itemId);
  if (tierPiece?.tier === "t9" || tierPiece?.tier === "t10") {
    const baseSource = tierPiece.slot === 6 || tierPiece.slot === 8
      ? RaidNames.vaultOfArchavon[locale]
      : t("bisPanel.emblemsOfFrost");
    const upgradeRaid = formatDungeonExportLabel({
      name: RaidNames.icecrownCitadel.en,
      raidKey: "icecrownCitadel",
      size: 25,
      difficulty: DungeonDifficulty.HEROIC,
    }, locale);
    return `${baseSource} + ${upgradeRaid}`;
  }
  return getFormattedItemDropSources(itemId, locale)
    .map((source) => `${source.raidLabel} · ${source.bossName}`)
    .join(" · ");
}
