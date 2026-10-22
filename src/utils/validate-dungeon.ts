import type { EmblemKey } from "../assets/emblems/emblem-icons.ts";
import { EmblemKey as EmblemKeyValues } from "../assets/emblems/emblem-icons.ts";
import {
  MAX_DUNGEON_SHORT_NAME_LENGTH,
  type DungeonFormValues,
} from "../constants/dungeon-form-defaults.ts";
import type { AppLocale } from "../i18n/types.ts";
import { createTranslator } from "../i18n/translate.ts";
import type {
  DungeonCustomizationUpdate,
  DungeonRecord,
} from "../types/dungeons.ts";
import {
  defaultShortNameForDungeonName,
  difficultyForRaidName,
  raidNameForDifficulty,
} from "./dungeon-short-name.ts";
import { parseItemLevelInput } from "./parse-item-level-input.ts";

export type { DungeonFormValues } from "../constants/dungeon-form-defaults.ts";

export type DungeonCustomizationValues = {
  name: string;
  shortName: string;
  size: DungeonRecord["size"];
  difficulty: DungeonRecord["difficulty"];
  emblem: EmblemKey | "";
};

export type ParseDungeonCustomizationResult =
  | { ok: true; fields: DungeonCustomizationUpdate }
  | { ok: false; error: string };

const VALID_EMBLEM_KEYS = new Set<string>(Object.values(EmblemKeyValues));

export function dungeonCustomizationFormValues(
  dungeon: DungeonRecord,
): DungeonCustomizationValues {
  return {
    name: dungeon.name,
    shortName: dungeon.shortName ?? "",
    size: dungeon.size,
    difficulty: dungeon.difficulty,
    emblem: dungeon.emblem ?? "",
  };
}

export function parseDungeonCustomizationForm(
  values: DungeonCustomizationValues,
  locale: AppLocale = "en",
): ParseDungeonCustomizationResult {
  const t = createTranslator(locale);
  const trimmedName = values.name.trim();
  if (!trimmedName) {
    return { ok: false, error: t("validation.dungeonNameRequired") };
  }
  const normalizedName =
    raidNameForDifficulty(trimmedName, values.difficulty, locale) ?? trimmedName;
  const normalizedDifficulty =
    difficultyForRaidName(normalizedName) ?? values.difficulty;
  const trimmedShortName = values.shortName.trim();
  if (trimmedShortName.length > MAX_DUNGEON_SHORT_NAME_LENGTH) {
    return {
      ok: false,
      error: t("validation.shortNameTooLong", {
        max: MAX_DUNGEON_SHORT_NAME_LENGTH,
      }),
    };
  }
  const emblemValue = values.emblem.trim();
  if (emblemValue && !VALID_EMBLEM_KEYS.has(emblemValue)) {
    return { ok: false, error: t("validation.invalidEmblem") };
  }
  const shortName =
    (normalizedName !== trimmedName
      ? defaultShortNameForDungeonName(normalizedName)
      : trimmedShortName || defaultShortNameForDungeonName(normalizedName)) ||
    undefined;
  const emblem = emblemValue ? (emblemValue as EmblemKey) : undefined;
  return {
    ok: true,
    fields: {
      name: normalizedName,
      ...(shortName ? { shortName } : {}),
      size: values.size,
      difficulty: normalizedDifficulty,
      ...(emblem ? { emblem } : {}),
    },
  };
}

export type ParsedDungeonFormFields = {
  name: string;
  shortName?: string;
  size: DungeonRecord["size"];
  itemLevel: number[];
  difficulty: DungeonRecord["difficulty"];
};

export type ParseDungeonFormResult =
  | { ok: true; fields: ParsedDungeonFormFields }
  | { ok: false; error: string };

export function parseDungeonForm(
  values: DungeonFormValues,
  locale: AppLocale = "en",
): ParseDungeonFormResult {
  const t = createTranslator(locale);
  const trimmedName = values.name.trim();
  if (!trimmedName) {
    return { ok: false, error: t("validation.dungeonNameRequired") };
  }
  const normalizedName =
    raidNameForDifficulty(trimmedName, values.difficulty, locale) ?? trimmedName;
  const normalizedDifficulty =
    difficultyForRaidName(normalizedName) ?? values.difficulty;
  const trimmedShortName = values.shortName.trim();
  if (trimmedShortName.length > MAX_DUNGEON_SHORT_NAME_LENGTH) {
    return {
      ok: false,
      error: t("validation.shortNameTooLong", {
        max: MAX_DUNGEON_SHORT_NAME_LENGTH,
      }),
    };
  }
  const itemLevels = parseItemLevelInput(values.itemLevelText);
  if (itemLevels.length === 0) {
    return { ok: false, error: t("validation.itemLevelRequired") };
  }
  const shortName =
    (normalizedName !== trimmedName
      ? defaultShortNameForDungeonName(normalizedName)
      : trimmedShortName || defaultShortNameForDungeonName(normalizedName)) ||
    undefined;
  return {
    ok: true,
    fields: {
      name: normalizedName,
      ...(shortName ? { shortName } : {}),
      size: values.size,
      itemLevel: itemLevels,
      difficulty: normalizedDifficulty,
    },
  };
}
