import { RaidBossNames } from "../data/raid-boss-names.ts";
import { RaidNames, type RaidKey } from "../data/raid-names.ts";
import { ClassSpecNames } from "../data/class-specs.ts";
import { ClassName, type ClassName as ClassNameType } from "../types/characters.ts";
import { DungeonDifficulty, type Dungeon } from "../types/dungeons.ts";
import { EmblemKey, emblemLabels } from "../assets/emblems/emblem-icons.ts";
import type { AppLocale } from "./types.ts";
import { resolveDungeonRaidKey } from "../utils/resolve-dungeon-raid-key.ts";
import { formatDungeonTypeLabel } from "../utils/dungeon-type.ts";

const classNamesRu: Record<ClassNameType, string> = {
  [ClassName.DeathKnight]: "Рыцарь смерти",
  [ClassName.Druid]: "Друид",
  [ClassName.Hunter]: "Охотник",
  [ClassName.Mage]: "Маг",
  [ClassName.Paladin]: "Паладин",
  [ClassName.Priest]: "Жрец",
  [ClassName.Rogue]: "Разбойник",
  [ClassName.Shaman]: "Шаман",
  [ClassName.Warlock]: "Чернокнижник",
  [ClassName.Warrior]: "Воин",
};

const gearSlotNamesRu = [
  "Голова",
  "Шея",
  "Плечи",
  "Спина",
  "Грудь",
  "Запястья",
  "Кисти рук",
  "Пояс",
  "Ноги",
  "Ступни",
  "Палец 1",
  "Палец 2",
  "Аксессуар 1",
  "Аксессуар 2",
  "Правая рука",
  "Левая рука",
  "Дальний бой",
] as const;

const emblemLabelsRu: Record<EmblemKey, string> = {
  [EmblemKey.CONQUEST]: "Завоевания",
  [EmblemKey.FROST]: "Льда",
  [EmblemKey.HEROISM]: "Героизма",
  [EmblemKey.TRIUMPH]: "Триумфа",
  [EmblemKey.VALOR]: "Доблести",
};

function raidDisplayName(raidKey: RaidKey, locale: AppLocale, compact: boolean): string {
  const raid = RaidNames[raidKey];
  if (compact) {
    const short =
      locale === "ru"
        ? raid.shortRu
        : "shortEn" in raid
          ? raid.shortEn
          : undefined;
    if (short) {
      return short;
    }
  }
  return locale === "ru" ? raid.ru : raid.en;
}

export function getLocalizedClassName(
  className: ClassNameType,
  locale: AppLocale,
): string {
  return locale === "ru" ? classNamesRu[className] : className;
}

/** WowSims drop boss label (`wotlk-item-drop-sources.json` `b` field). */
export function getLocalizedBossName(
  bossNameEn: string,
  locale: AppLocale,
): string {
  const entry = RaidBossNames[bossNameEn];
  if (!entry) {
    return bossNameEn;
  }
  return locale === "ru" ? entry.ru : entry.en;
}

export function getLocalizedSpecName(
  className: ClassNameType,
  spec: string,
  locale: AppLocale,
  short = false,
): string {
  const entry = ClassSpecNames[className]?.[spec];
  if (!entry) {
    return spec;
  }
  if (short) {
    return locale === "ru" ? entry.shortRu : entry.shortEn;
  }
  return locale === "ru" ? entry.ru : entry.en;
}

export function getLocalizedGearSlotLabel(slot: number, locale: AppLocale): string {
  if (locale === "ru" && slot >= 0 && slot < gearSlotNamesRu.length) {
    return gearSlotNamesRu[slot] ?? `Слот ${slot}`;
  }
  const enNames = [
    "Head",
    "Neck",
    "Shoulder",
    "Back",
    "Chest",
    "Wrist",
    "Hands",
    "Waist",
    "Legs",
    "Feet",
    "Finger 1",
    "Finger 2",
    "Trinket 1",
    "Trinket 2",
    "Main hand",
    "Off hand",
    "Ranged",
  ];
  return enNames[slot] ?? `Slot ${slot}`;
}

export function getLocalizedDifficulty(
  difficulty: (typeof DungeonDifficulty)[keyof typeof DungeonDifficulty],
  locale: AppLocale,
): string {
  if (locale === "ru") {
    return difficulty === DungeonDifficulty.NORMAL ? "Обычный" : "Героический";
  }
  return difficulty;
}

export function getLocalizedEmblemLabel(
  emblem: EmblemKey,
  locale: AppLocale,
): string {
  return locale === "ru" ? emblemLabelsRu[emblem] : emblemLabels[emblem];
}

export function getLocalizedDungeonDisplayName(
  dungeon: Pick<Dungeon, "name" | "shortName" | "raidKey">,
  locale: AppLocale,
  compact: boolean,
): string {
  const raidKey = resolveDungeonRaidKey(dungeon);
  if (raidKey) {
    return raidDisplayName(raidKey, locale, compact);
  }
  if (compact && dungeon.shortName) {
    return dungeon.shortName;
  }
  return dungeon.name;
}

/** Compact table: short raid name + size (+ skull for Heroic), e.g. `ICC 25 ☠️`. */
export function getLocalizedDungeonCompactLabel(
  dungeon: Pick<Dungeon, "name" | "shortName" | "raidKey" | "size" | "difficulty">,
  locale: AppLocale,
  heroicSkullIcon = "☠️",
): string {
  const shortName = getLocalizedDungeonDisplayName(dungeon, locale, true);
  const typeLabel = formatDungeonTypeLabel(
    dungeon,
    locale,
    dungeon.difficulty === DungeonDifficulty.HEROIC ? "skull" : "suffix",
    heroicSkullIcon,
  );
  return `${shortName} ${typeLabel}`;
}
