import type { CharacterSpecGear, CharacterRecord } from "../types/characters.ts";
import type { AppLocale } from "../i18n/types.ts";
import { getLocalizedSpecName } from "../i18n/localized-domain.ts";
import type { ClassName } from "../types/characters.ts";
import { formatCharacterDisplayName } from "./character-display.ts";

function formatGearScoreShort(gearScore: number, suffix: "k" | ""): string {
  if (gearScore < 1000) {
    return String(gearScore);
  }
  const thousands = Math.floor((gearScore / 1000) * 10) / 10;
  const value = Number.isInteger(thousands)
    ? String(thousands)
    : thousands.toFixed(1);
  return suffix ? `${value}${suffix}` : value;
}

export function formatCompactGearScore(gearScore: number): string {
  return formatGearScoreShort(gearScore, "k");
}

/** Export lines: compact gear score without a thousands suffix (e.g. `6.6`). */
export function formatExportGearScore(gearScore: number): string {
  return formatGearScoreShort(gearScore, "");
}

export function formatSpecGearLine(
  pair: CharacterSpecGear,
  className?: ClassName,
  locale: AppLocale = "en",
): string {
  const specLabel =
    className !== undefined
      ? getLocalizedSpecName(className, pair.spec, locale)
      : pair.spec;
  if (pair.gearScore !== undefined) {
    return `${specLabel} · ${formatCompactGearScore(pair.gearScore)}`;
  }
  return specLabel;
}

export function formatCharacterSpecGearSummary(
  character: Pick<CharacterRecord, "mainSpec" | "offSpec" | "class">,
  locale: AppLocale = "en",
): string | null {
  const className = character.class?.name;
  const parts: string[] = [];
  if (character.mainSpec) {
    parts.push(formatSpecGearLine(character.mainSpec, className, locale));
  }
  if (character.offSpec) {
    parts.push(formatSpecGearLine(character.offSpec, className, locale));
  }
  return parts.length > 0 ? parts.join(" / ") : null;
}

export function formatCharacterDetailsTooltip(
  character: CharacterRecord,
  locale: AppLocale = "en",
): string {
  const displayName = formatCharacterDisplayName(character.name);
  const specGearSummary = formatCharacterSpecGearSummary(character, locale);
  if (!specGearSummary) {
    return displayName;
  }
  return `${displayName}\n${specGearSummary}`;
}
