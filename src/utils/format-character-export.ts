import { getLocalizedSpecName } from "../i18n/localized-domain.ts";
import type { AppLocale } from "../i18n/types.ts";
import type { ClassName, CharacterRecord, CharacterSpecGear } from "../types/characters.ts";
import { formatCharacterDisplayName } from "./character-display.ts";
import { formatExportGearScore } from "./format-character-details.ts";
import {
  DEFAULT_EXPORT_ROLE_FILTER,
  specPassesExportRoleFilter,
  type ExportRoleFilter,
} from "./export-spec-role.ts";

export type CharacterExportSpecSelection = {
  includeMain: boolean;
  includeOff: boolean;
  /** For characters with no specs: include name-only in export lines. */
  includeWithoutSpec: boolean;
};

export type ExportSpecSelectionByCharacterId = Readonly<
  Record<string, Partial<CharacterExportSpecSelection>>
>;

export function characterHasExportSpecs(
  character: Pick<CharacterRecord, "mainSpec" | "offSpec">,
): boolean {
  return Boolean(character.mainSpec || character.offSpec);
}

export function defaultExportSpecSelection(
  character: Pick<CharacterRecord, "mainSpec" | "offSpec">,
): CharacterExportSpecSelection {
  return {
    includeMain: Boolean(character.mainSpec),
    includeOff: Boolean(character.offSpec),
    includeWithoutSpec: true,
  };
}

export function buildSelectAllExportSpecSelection(
  characters: readonly CharacterRecord[],
  includedCharacterIds?: ReadonlySet<string>,
): ExportSpecSelectionByCharacterId {
  const selection: Record<string, Partial<CharacterExportSpecSelection>> = {};
  for (const character of characters) {
    selection[character.id] =
      includedCharacterIds === undefined || includedCharacterIds.has(character.id)
        ? defaultExportSpecSelection(character)
        : {
            includeMain: false,
            includeOff: false,
            includeWithoutSpec: false,
          };
  }
  return selection;
}

export function buildClearAllExportSpecSelection(
  characters: readonly CharacterRecord[],
): ExportSpecSelectionByCharacterId {
  const selection: Record<string, Partial<CharacterExportSpecSelection>> = {};
  for (const character of characters) {
    selection[character.id] = {
      includeMain: false,
      includeOff: false,
      includeWithoutSpec: false,
    };
  }
  return selection;
}

export function clearUnavailableExportSpecSelections(
  characters: readonly CharacterRecord[],
  exportSpecSelectionByCharacterId: ExportSpecSelectionByCharacterId,
  includedCharacterIds: ReadonlySet<string>,
): ExportSpecSelectionByCharacterId {
  let changed = false;
  const nextSelection: Record<string, Partial<CharacterExportSpecSelection>> = {
    ...exportSpecSelectionByCharacterId,
  };

  for (const character of characters) {
    if (includedCharacterIds.has(character.id)) {
      continue;
    }

    const resolved = resolveExportSpecSelection(
      character,
      exportSpecSelectionByCharacterId,
    );
    if (
      !resolved.includeMain &&
      !resolved.includeOff &&
      !resolved.includeWithoutSpec
    ) {
      continue;
    }

    nextSelection[character.id] = {
      ...nextSelection[character.id],
      includeMain: false,
      includeOff: false,
      includeWithoutSpec: false,
    };
    changed = true;
  }

  return changed ? nextSelection : exportSpecSelectionByCharacterId;
}

export function resolveExportSpecSelection(
  character: CharacterRecord,
  exportSpecSelectionByCharacterId?: ExportSpecSelectionByCharacterId,
): CharacterExportSpecSelection {
  const defaults = defaultExportSpecSelection(character);
  const stored = exportSpecSelectionByCharacterId?.[character.id];
  return {
    includeMain: character.mainSpec
      ? (stored?.includeMain ?? defaults.includeMain)
      : false,
    includeOff: character.offSpec
      ? (stored?.includeOff ?? defaults.includeOff)
      : false,
    includeWithoutSpec: stored?.includeWithoutSpec ?? defaults.includeWithoutSpec,
  };
}

export function isSpecIncludedForExportRole(
  character: Pick<CharacterRecord, "class">,
  spec: string,
  roleFilter: ExportRoleFilter = DEFAULT_EXPORT_ROLE_FILTER,
): boolean {
  return specPassesExportRoleFilter(character.class?.name, spec, roleFilter);
}

/** Stored spec toggles with export filters applied for display and export lines. */
export function resolveEffectiveExportSpecSelection(
  character: CharacterRecord,
  exportSpecSelectionByCharacterId?: ExportSpecSelectionByCharacterId,
  roleFilter: ExportRoleFilter = DEFAULT_EXPORT_ROLE_FILTER,
  minGearScore?: number,
): CharacterExportSpecSelection {
  const selection = resolveExportSpecSelection(
    character,
    exportSpecSelectionByCharacterId,
  );

  return {
    includeMain:
      selection.includeMain &&
      (!character.mainSpec ||
        (isSpecIncludedForExportRole(character, character.mainSpec.spec, roleFilter) &&
          specPassesExportMinGearScore(character.mainSpec, minGearScore))),
    includeOff:
      selection.includeOff &&
      (!character.offSpec ||
        (isSpecIncludedForExportRole(character, character.offSpec.spec, roleFilter) &&
          specPassesExportMinGearScore(character.offSpec, minGearScore))),
    includeWithoutSpec: selection.includeWithoutSpec,
  };
}

export function isCharacterIncludedInExport(
  character: Pick<CharacterRecord, "mainSpec" | "offSpec">,
  selection: CharacterExportSpecSelection,
): boolean {
  if (!characterHasExportSpecs(character)) {
    return selection.includeWithoutSpec;
  }
  return selection.includeMain || selection.includeOff;
}

export function specPassesExportMinGearScore(
  specGear: CharacterSpecGear,
  minGearScore?: number,
): boolean {
  if (minGearScore === undefined) {
    return true;
  }
  if (specGear.gearScore === undefined) {
    return true;
  }
  return specGear.gearScore >= minGearScore;
}

export type CharacterExportInactiveReason = "cooldown" | "filters";

export function characterSpecPassesExportFilters(
  character: CharacterRecord,
  specGear: CharacterSpecGear,
  roleFilter: ExportRoleFilter = DEFAULT_EXPORT_ROLE_FILTER,
  minGearScore?: number,
): boolean {
  return (
    isSpecIncludedForExportRole(character, specGear.spec, roleFilter) &&
    specPassesExportMinGearScore(specGear, minGearScore)
  );
}

export function characterHasSpecPassingExportFilters(
  character: CharacterRecord,
  roleFilter: ExportRoleFilter = DEFAULT_EXPORT_ROLE_FILTER,
  minGearScore?: number,
): boolean {
  if (!characterHasExportSpecs(character)) {
    return true;
  }

  const mainPasses = Boolean(
    character.mainSpec &&
      characterSpecPassesExportFilters(
        character,
        character.mainSpec,
        roleFilter,
        minGearScore,
      ),
  );
  const offPasses = Boolean(
    character.offSpec &&
      characterSpecPassesExportFilters(
        character,
        character.offSpec,
        roleFilter,
        minGearScore,
      ),
  );
  return mainPasses || offPasses;
}

/** Why a character row is inactive in the spec filter (CD on all visible raids, or filters). */
export function getCharacterExportInactiveReason(
  character: CharacterRecord,
  includedCharacterIds: ReadonlySet<string>,
  roleFilter: ExportRoleFilter = DEFAULT_EXPORT_ROLE_FILTER,
  minGearScore?: number,
): CharacterExportInactiveReason | null {
  if (!includedCharacterIds.has(character.id)) {
    return "cooldown";
  }
  if (
    characterHasExportSpecs(character) &&
    !characterHasSpecPassingExportFilters(character, roleFilter, minGearScore)
  ) {
    return "filters";
  }
  return null;
}

function formatSpecExportSegment(
  className: ClassName,
  specGear: CharacterSpecGear,
  locale: AppLocale = "en",
  includeGearScore = true,
): string {
  const spec = getLocalizedSpecName(className, specGear.spec, locale, true);
  if (includeGearScore && specGear.gearScore !== undefined) {
    return `${spec} ${formatExportGearScore(specGear.gearScore)}`;
  }
  return spec;
}

export type CharacterExportFormatOptions = {
  /** When false, export the character name only (no `: Spec` segment). Default true. */
  includeSpecs?: boolean;
  /** When false, omit gear score after each short spec. Default true. */
  includeGearScore?: boolean;
};

/**
 * Compact roster label: `Name MainShort mainGs / OffShort offGs`.
 * Returns `null` when the character should be omitted from export lines.
 */
export function formatCharacterExportLabel(
  character: CharacterRecord,
  selection: CharacterExportSpecSelection = defaultExportSpecSelection(character),
  locale: AppLocale = "en",
  format: CharacterExportFormatOptions = {},
): string | null {
  if (!isCharacterIncludedInExport(character, selection)) {
    return null;
  }

  const includeSpecs = format.includeSpecs !== false;
  const includeGearScore = format.includeGearScore !== false;
  const displayName = formatCharacterDisplayName(character.name);

  if (!includeSpecs) {
    return displayName;
  }

  const className = character.class?.name;
  const specSegments: string[] = [];

  if (
    selection.includeMain &&
    character.mainSpec &&
    className
  ) {
    specSegments.push(
      formatSpecExportSegment(
        className,
        character.mainSpec,
        locale,
        includeGearScore,
      ),
    );
  }
  if (
    selection.includeOff &&
    character.offSpec &&
    className
  ) {
    specSegments.push(
      formatSpecExportSegment(
        className,
        character.offSpec,
        locale,
        includeGearScore,
      ),
    );
  }

  if (specSegments.length === 0) {
    if (characterHasExportSpecs(character)) {
      return null;
    }
    return displayName;
  }

  return `${displayName} ${specSegments.join(" / ")}`;
}
