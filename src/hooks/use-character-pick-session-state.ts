import { useCallback, useState } from "react";
import type { CharacterRecord } from "../types/characters.ts";
import {
  DEFAULT_EXPORT_ROLE_FILTER,
  type ExportRoleFilter,
} from "../utils/export-spec-role.ts";
import { toggleDungeonIdExclusion } from "../utils/filter-dungeons-excluding-ids.ts";
import {
  buildClearAllExportSpecSelection,
  buildSelectAllExportSpecSelection,
  resolveExportSpecSelection,
  type CharacterExportSpecSelection,
} from "../utils/format-character-export.ts";
import { EXPORT_MIN_GS_COMPACT_DEFAULT } from "../utils/parse-export-min-gear-score.ts";

/**
 * Session-only Character pick UI state. Owned above the overlay so switching
 * toolbar panels does not reset filters / specs / raid exclusions.
 */
export function useCharacterPickSessionState() {
  const [exportSpecSelectionByCharacterId, setExportSpecSelectionByCharacterId] =
    useState<Record<string, Partial<CharacterExportSpecSelection>>>({});
  const [minGearScoreFilterEnabled, setMinGearScoreFilterEnabled] =
    useState(false);
  const [minGearScoreCompact, setMinGearScoreCompact] = useState(
    EXPORT_MIN_GS_COMPACT_DEFAULT,
  );
  const [roleFilter, setRoleFilter] = useState<ExportRoleFilter>(() => ({
    ...DEFAULT_EXPORT_ROLE_FILTER,
  }));
  const [excludedDungeonIds, setExcludedDungeonIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [includeExportSpecs, setIncludeExportSpecs] = useState(true);
  const [includeExportGearScore, setIncludeExportGearScore] = useState(true);
  const [onlyCharactersWithUpgrades, setOnlyCharactersWithUpgrades] =
    useState(false);

  const resetAllFilters = useCallback(() => {
    setExportSpecSelectionByCharacterId({});
    setMinGearScoreFilterEnabled(false);
    setMinGearScoreCompact(EXPORT_MIN_GS_COMPACT_DEFAULT);
    setRoleFilter({ ...DEFAULT_EXPORT_ROLE_FILTER });
    setExcludedDungeonIds(new Set());
    setOnlyCharactersWithUpgrades(false);
  }, []);

  const clearExcludedDungeonIds = useCallback(() => {
    setExcludedDungeonIds(new Set());
  }, []);

  const toggleDungeonExcluded = useCallback((dungeonId: string) => {
    setExcludedDungeonIds((previous) =>
      toggleDungeonIdExclusion(previous, dungeonId),
    );
  }, []);

  const selectAllCharacterSpecs = useCallback(
    (
      characters: readonly CharacterRecord[],
      includedCharacterIds: ReadonlySet<string>,
    ) => {
      setExportSpecSelectionByCharacterId(
        buildSelectAllExportSpecSelection(characters, includedCharacterIds),
      );
    },
    [],
  );

  const clearAllCharacterSpecs = useCallback(
    (characters: readonly CharacterRecord[]) => {
      setExportSpecSelectionByCharacterId(
        buildClearAllExportSpecSelection(characters),
      );
    },
    [],
  );

  const setSpecIncluded = useCallback(
    (
      character: CharacterRecord,
      slot: keyof CharacterExportSpecSelection,
      included: boolean,
    ) => {
      setExportSpecSelectionByCharacterId((previous) => {
        const resolved = resolveExportSpecSelection(character, previous);
        return {
          ...previous,
          [character.id]: {
            ...previous[character.id],
            includeMain:
              slot === "includeMain" ? included : resolved.includeMain,
            includeOff: slot === "includeOff" ? included : resolved.includeOff,
            includeWithoutSpec:
              slot === "includeWithoutSpec"
                ? included
                : resolved.includeWithoutSpec,
          },
        };
      });
    },
    [],
  );

  return {
    exportSpecSelectionByCharacterId,
    minGearScoreFilterEnabled,
    minGearScoreCompact,
    roleFilter,
    excludedDungeonIds,
    includeExportSpecs,
    includeExportGearScore,
    onlyCharactersWithUpgrades,
    setMinGearScoreFilterEnabled,
    setMinGearScoreCompact,
    setRoleFilter,
    setIncludeExportSpecs,
    setIncludeExportGearScore,
    setOnlyCharactersWithUpgrades,
    resetAllFilters,
    clearExcludedDungeonIds,
    toggleDungeonExcluded,
    selectAllCharacterSpecs,
    clearAllCharacterSpecs,
    setSpecIncluded,
  };
}

export type CharacterPickSessionState = ReturnType<typeof useCharacterPickSessionState>;
