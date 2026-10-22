import { RaidNames } from "../data/raid-names.ts";
import type { AppLocale } from "../i18n/types.ts";
import type { Dungeon } from "../types/dungeons.ts";
import { DungeonDifficulty } from "../types/dungeons.ts";

type RaidNameEntry = (typeof RaidNames)[keyof typeof RaidNames];

type RaidNameMatch = { raid: RaidNameEntry; heroic: boolean };

function findRaidByName(name: string): RaidNameMatch | undefined {
  for (const raid of Object.values(RaidNames)) {
    if (raid.ru === name || raid.en === name) {
      return { raid, heroic: false };
    }
    if ("heroic" in raid && (raid.heroic.ru === name || raid.heroic.en === name)) {
      return { raid, heroic: true };
    }
  }
  return undefined;
}

export function getLocalizedRaidNameSuggestions(locale: AppLocale): string[] {
  return Object.values(RaidNames)
    .flatMap((raid) => [
      locale === "ru" ? raid.ru : raid.en,
      ...("heroic" in raid
        ? [locale === "ru" ? raid.heroic.ru : raid.heroic.en]
        : []),
    ])
    .sort((left, right) => left.localeCompare(right, locale));
}

export function isKnownRaidName(name: string): boolean {
  return findRaidByName(name) !== undefined;
}

export function defaultShortNameForDungeonName(name: string): string | undefined {
  const match = findRaidByName(name);
  if (!match) {
    return undefined;
  }
  const raid = match.raid;
  if (match.heroic && "heroic" in raid) {
    return raid.heroic.ru === name ? raid.heroic.shortRu : raid.heroic.shortEn;
  }
  if (raid.ru === name) {
    return raid.shortRu;
  }
  return "shortEn" in raid ? raid.shortEn : undefined;
}

/** Difficulty encoded by a raid name variant, when that raid has distinct names. */
export function difficultyForRaidName(
  name: string,
): Dungeon["difficulty"] | undefined {
  const match = findRaidByName(name);
  if (!match || !("heroic" in match.raid)) {
    return undefined;
  }
  return match.heroic ? DungeonDifficulty.HEROIC : DungeonDifficulty.NORMAL;
}

/** Return the localized name for a raid's selected difficulty variant. */
export function raidNameForDifficulty(
  name: string,
  difficulty: Dungeon["difficulty"],
  locale: AppLocale,
): string | undefined {
  const match = findRaidByName(name);
  if (!match || !("heroic" in match.raid)) {
    return undefined;
  }
  const useHeroic = difficulty === DungeonDifficulty.HEROIC;
  const variant = useHeroic ? match.raid.heroic : match.raid;
  return locale === "ru" ? variant.ru : variant.en;
}

export function getDungeonDisplayName(
  dungeon: Pick<Dungeon, "name" | "shortName">,
  compact: boolean,
): string {
  if (compact && dungeon.shortName) {
    return dungeon.shortName;
  }
  return dungeon.name;
}
