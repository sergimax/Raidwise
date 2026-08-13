import type { CharacterRecord } from "../types/characters.ts";
import type { DungeonRecord, DungeonToggles } from "../types/dungeons.ts";
import type { RaidKey } from "../data/raid-names.ts";
import type { AppLocale } from "../i18n/types.ts";
import type { TranslateFn } from "../i18n/translate.ts";
import {
  formatCharacterExportLabel,
  resolveEffectiveExportSpecSelection,
  type CharacterExportFormatOptions,
  type ExportSpecSelectionByCharacterId,
} from "./format-character-export.ts";
import { formatDungeonExportLabel } from "./format-dungeon-label.ts";
import { isCooldownOn } from "./dungeon-toggles.ts";
import type { ExportRoleFilter } from "./export-spec-role.ts";
import { DEFAULT_EXPORT_ROLE_FILTER } from "./export-spec-role.ts";
import { resolveDungeonRaidKey } from "./resolve-dungeon-raid-key.ts";

export type BuildExportStatusParams = {
  characters: CharacterRecord[];
  dungeons: DungeonRecord[];
  dungeonToggles: DungeonToggles;
  exportSpecSelectionByCharacterId?: ExportSpecSelectionByCharacterId;
  minGearScore?: number;
  roleFilter?: ExportRoleFilter;
  locale?: AppLocale;
  /** Controls whether copy lines include short specs and/or gear scores. */
  format?: CharacterExportFormatOptions;
  t: TranslateFn;
};

export type ExportStatusLine = {
  dungeonId: string;
  raidKey?: RaidKey;
  raidLabel: string;
  charactersLabel: string;
};

export type BuildExportStatusResult =
  | { kind: "message"; message: string }
  | { kind: "lines"; lines: ExportStatusLine[] };

/** PM paste text — characters only; raid label is shown separately in the UI. */
export function formatExportLineCopyText(line: ExportStatusLine): string {
  return line.charactersLabel;
}

/** Characters without CD (toggle off) per visible dungeon. */
export function hasCharacterWithoutCdInVisibleDungeons(
  characterId: string,
  dungeons: readonly DungeonRecord[],
  dungeonToggles: DungeonToggles,
): boolean {
  return dungeons.some((dungeon) => !isCooldownOn(dungeonToggles, characterId, dungeon.id));
}

/** Characters without CD (toggle off) per visible dungeon. */
export function buildExportStatus({
  characters,
  dungeons,
  dungeonToggles,
  exportSpecSelectionByCharacterId,
  minGearScore,
  roleFilter,
  locale = "en",
  format,
  t,
}: BuildExportStatusParams): BuildExportStatusResult {
  const effectiveRoleFilter = roleFilter ?? DEFAULT_EXPORT_ROLE_FILTER;

  if (dungeons.length === 0) {
    return { kind: "message", message: t("exportPanel.noDungeonsFilter") };
  }
  if (characters.length === 0) {
    return { kind: "message", message: t("exportPanel.selectCharacter") };
  }

  const lines: ExportStatusLine[] = [];

  for (const dungeon of dungeons) {
    const charactersWithoutCd = characters.filter(
      (character) =>
        hasCharacterWithoutCdInVisibleDungeons(character.id, [dungeon], dungeonToggles),
    );
    if (charactersWithoutCd.length === 0) {
      continue;
    }
    const raidLabel = formatDungeonExportLabel(dungeon, locale);
    const charactersLabel = charactersWithoutCd
      .map((character) =>
        formatCharacterExportLabel(
          character,
          resolveEffectiveExportSpecSelection(
            character,
            exportSpecSelectionByCharacterId,
            effectiveRoleFilter,
            minGearScore,
          ),
          locale,
          format,
        ),
      )
      .filter((entry): entry is string => entry !== null)
      .join(", ");
    if (charactersLabel.length === 0) {
      continue;
    }
    lines.push({
      dungeonId: dungeon.id,
      raidKey: resolveDungeonRaidKey(dungeon),
      raidLabel,
      charactersLabel,
    });
  }

  if (lines.length === 0) {
    return { kind: "message", message: t("exportPanel.allHaveCd") };
  }

  return { kind: "lines", lines };
}

/** Newline-joined copy text for all export lines (legacy / clipboard bulk). */
export function buildExportStatusString(params: BuildExportStatusParams): string {
  const result = buildExportStatus(params);
  if (result.kind === "message") {
    return result.message;
  }
  return result.lines.map(formatExportLineCopyText).join("\n");
}
