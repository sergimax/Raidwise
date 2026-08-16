import { Box } from "@mui/material";
import { useMemo } from "react";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  clearUnavailableExportSpecSelections,
  isCharacterIncludedInExport,
  resolveEffectiveExportSpecSelection,
} from "../../utils/format-character-export.ts";
import {
  buildExportStatus,
  hasCharacterWithoutCdInVisibleDungeons,
} from "../../utils/build-export-status.ts";
import { characterHasGearPickUpgrades } from "../../utils/build-gear-pick-items.ts";
import { resolveExportMinGearScoreThreshold } from "../../utils/parse-export-min-gear-score.ts";
import { filterDungeonsExcludingIds } from "../../utils/filter-dungeons-excluding-ids.ts";
import { GearPickCharacterFilterActions } from "../gear-pick-panel/gear-pick-character-filter-actions.tsx";
import { CharacterPickSpecFilter } from "./character-spec-filter.tsx";
import { CharacterPickSpecFilterActions } from "./character-spec-filter-actions.tsx";
import { DungeonFilter } from "../filter-unit/dungeon-filter.tsx";
import { DungeonFilterActions } from "../filter-unit/dungeon-filter-actions.tsx";
import { FilterSection } from "../filter-unit/filter-section.tsx";
import { CharacterPickFilterBlock } from "./filter-block.tsx";
import { CharacterPickMinGearScoreFilter } from "./min-gear-score-filter.tsx";
import { CharacterPickRoleFilter } from "./role-filter.tsx";
import { CharacterPickResultLines } from "./result-lines.tsx";
import {
  dungeonFilterContentSx,
  FILTER_UNIT_GRID_GAP_SPACING,
  CHARACTER_PICK_SIDE_BY_SIDE_MQ_KEY,
  getCharacterPickFilterGridHeight,
  getCharacterPickFilterGridTemplateAreas,
  getCharacterPickFilterGridTemplateColumns,
  getCharacterPickFilterGridTemplateRows,
  getCharacterPickResultColumnMinWidth,
} from "./constants.ts";
import type { CharacterPickPanelProps } from "./types.ts";

export function CharacterPickPanel({
  characters,
  visibleDungeons,
  dungeonToggles,
  dungeonNameSearch,
  onDungeonNameSearchChange,
  totalDungeonCount,
  session,
}: CharacterPickPanelProps) {
  const { t, locale } = useTranslation();
  const { getBisSlotMapForSpec } = useBisListsContext();
  const {
    exportSpecSelectionByCharacterId,
    minGearScoreFilterEnabled,
    minGearScoreCompact,
    roleFilter,
    excludedDungeonIds,
    setMinGearScoreFilterEnabled,
    setMinGearScoreCompact,
    setRoleFilter,
    clearExcludedDungeonIds,
    toggleDungeonExcluded,
    selectAllCharacterSpecs,
    clearAllCharacterSpecs,
    setSpecIncluded,
    includeExportSpecs,
    includeExportGearScore,
    setIncludeExportSpecs,
    setIncludeExportGearScore,
    onlyCharactersWithUpgrades,
    setOnlyCharactersWithUpgrades,
  } = session;

  const hasDungeonFilter = totalDungeonCount > 0;

  const activeDungeons = useMemo(
    () => filterDungeonsExcludingIds(visibleDungeons, excludedDungeonIds),
    [excludedDungeonIds, visibleDungeons],
  );

  const minGearScore = useMemo(
    () =>
      resolveExportMinGearScoreThreshold(
        minGearScoreFilterEnabled,
        minGearScoreCompact,
      ),
    [minGearScoreCompact, minGearScoreFilterEnabled],
  );

  const availableCharacterIds = useMemo(
    () =>
      new Set(
        characters
          .filter((character) =>
            hasCharacterWithoutCdInVisibleDungeons(
              character.id,
              activeDungeons,
              dungeonToggles,
            ),
          )
          .map((character) => character.id),
      ),
    [activeDungeons, characters, dungeonToggles],
  );

  const charactersWithUpgradesIds = useMemo(() => {
    if (!onlyCharactersWithUpgrades) {
      return new Set<string>();
    }
    return new Set(
      characters
        .filter((character) =>
          characterHasGearPickUpgrades({
            character,
            dungeons: activeDungeons,
            getBisSlotMapForSpec,
            locale,
          }),
        )
        .map((character) => character.id),
    );
  }, [
    activeDungeons,
    characters,
    getBisSlotMapForSpec,
    locale,
    onlyCharactersWithUpgrades,
  ]);

  /** Available for Select all / export lines: not on CD, and upgrades when toggled. */
  const selectableCharacterIds = useMemo(() => {
    if (!onlyCharactersWithUpgrades) {
      return availableCharacterIds;
    }
    return new Set(
      [...availableCharacterIds].filter((characterId) =>
        charactersWithUpgradesIds.has(characterId),
      ),
    );
  }, [
    availableCharacterIds,
    charactersWithUpgradesIds,
    onlyCharactersWithUpgrades,
  ]);

  const exportSpecSelectionForPanel = useMemo(
    () =>
      clearUnavailableExportSpecSelections(
        characters,
        exportSpecSelectionByCharacterId,
        selectableCharacterIds,
      ),
    [characters, exportSpecSelectionByCharacterId, selectableCharacterIds],
  );

  const resetDungeonFilter = () => {
    onDungeonNameSearchChange("");
    clearExcludedDungeonIds();
  };

  const dungeonFilterDirty =
    dungeonNameSearch.trim() !== "" || excludedDungeonIds.size > 0;

  const includedCharacters = useMemo(
    () =>
      characters.filter((character) =>
        isCharacterIncludedInExport(
          character,
          resolveEffectiveExportSpecSelection(
            character,
            exportSpecSelectionForPanel,
            roleFilter,
            minGearScore,
          ),
        ),
      ),
    [characters, exportSpecSelectionForPanel, minGearScore, roleFilter],
  );

  const exportStatus = useMemo(
    () =>
      buildExportStatus({
        characters: includedCharacters,
        dungeons: activeDungeons,
        dungeonToggles,
        exportSpecSelectionByCharacterId: exportSpecSelectionForPanel,
        minGearScore,
        roleFilter,
        locale,
        format: {
          includeSpecs: includeExportSpecs,
          includeGearScore: includeExportGearScore,
        },
        t,
      }),
    [
      activeDungeons,
      dungeonToggles,
      exportSpecSelectionForPanel,
      includeExportGearScore,
      includeExportSpecs,
      includedCharacters,
      locale,
      minGearScore,
      roleFilter,
      t,
    ],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: FILTER_UNIT_GRID_GAP_SPACING,
        alignItems: "stretch",
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        [CHARACTER_PICK_SIDE_BY_SIDE_MQ_KEY]: {
          flexDirection: "row",
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: getCharacterPickFilterGridTemplateColumns(),
          },
          gridTemplateRows: {
            xs: "auto",
            md: getCharacterPickFilterGridTemplateRows(),
          },
          gridTemplateAreas: {
            xs: "none",
            md: getCharacterPickFilterGridTemplateAreas(hasDungeonFilter),
          },
          gap: FILTER_UNIT_GRID_GAP_SPACING,
          alignItems: "stretch",
          width: { xs: "100%", md: "fit-content" },
          maxWidth: "100%",
          // Shrink with the Paper instead of forcing results past the right edge.
          flexShrink: 1,
          minWidth: 0,
        }}
      >
        {hasDungeonFilter ? (
          <CharacterPickFilterBlock gridArea="dungeon">
            <FilterSection
              step={1}
              title={t("characterPickPanel.dungeonFilterTitle")}
              titleMark={t("characterPickPanel.dungeonFilterTotalMark", {
                total: totalDungeonCount,
              })}
              description={t("characterPickPanel.dungeonFilterHelper")}
              titleActions={
                <DungeonFilterActions
                  disabled={!dungeonFilterDirty}
                  onReset={resetDungeonFilter}
                />
              }
              contentSx={dungeonFilterContentSx}
            >
              <DungeonFilter
                dungeonNameSearch={dungeonNameSearch}
                onDungeonNameSearchChange={onDungeonNameSearchChange}
                visibleDungeons={visibleDungeons}
                excludedDungeonIds={excludedDungeonIds}
                onToggleDungeonExcluded={toggleDungeonExcluded}
                locale={locale}
                t={t}
              />
            </FilterSection>
          </CharacterPickFilterBlock>
        ) : null}

        <CharacterPickFilterBlock gridArea="gearScore">
          <FilterSection
            step={2}
            title={t("characterPickPanel.gearScoreFilterTitle")}
            titleMark={t("common.optional")}
            description={t("characterPickPanel.minGearScoreHelper")}
            contentSx={{ overflow: "visible" }}
          >
            <CharacterPickMinGearScoreFilter
              enabled={minGearScoreFilterEnabled}
              compactValue={minGearScoreCompact}
              onEnabledChange={setMinGearScoreFilterEnabled}
              onCompactValueChange={setMinGearScoreCompact}
            />
          </FilterSection>
        </CharacterPickFilterBlock>

        <CharacterPickFilterBlock gridArea="role">
          <FilterSection
            step={3}
            title={t("characterPickPanel.roleFilterTitle")}
            description={t("characterPickPanel.roleFilterHelper")}
          >
            <CharacterPickRoleFilter
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
            />
          </FilterSection>
        </CharacterPickFilterBlock>

        <CharacterPickFilterBlock gridArea="characterSpecs">
          <FilterSection
            step={4}
            title={t("characterPickPanel.characterSpecsFilterTitle")}
            description={t("characterPickPanel.characterSpecsFilterHelper")}
            titleActions={
              <CharacterPickSpecFilterActions
                disabled={characters.length === 0}
                onSelectAll={() =>
                  selectAllCharacterSpecs(characters, selectableCharacterIds)
                }
                onClearAll={() => clearAllCharacterSpecs(characters)}
              />
            }
            descriptionActions={
              <GearPickCharacterFilterActions
                onlyWithUpgrades={onlyCharactersWithUpgrades}
                onOnlyWithUpgradesChange={setOnlyCharactersWithUpgrades}
              />
            }
          >
            <CharacterPickSpecFilter
              includedCharacterIds={availableCharacterIds}
              charactersWithUpgradesIds={charactersWithUpgradesIds}
              onlyWithUpgrades={onlyCharactersWithUpgrades}
              characters={characters}
              exportSpecSelectionByCharacterId={exportSpecSelectionForPanel}
              roleFilter={roleFilter}
              minGearScore={minGearScore}
              onSpecIncluded={setSpecIncluded}
            />
          </FilterSection>
        </CharacterPickFilterBlock>
      </Box>

      <Box
        sx={{
          flex: "none",
          minWidth: 0,
          width: "100%",
          maxWidth: "100%",
          [CHARACTER_PICK_SIDE_BY_SIDE_MQ_KEY]: {
            // Prefer 2-unit width; allow shrink so the column stays inside Paper padding.
            flex: "1 1 auto",
            flexBasis: getCharacterPickResultColumnMinWidth(),
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0,
            height: getCharacterPickFilterGridHeight(),
            maxHeight: getCharacterPickFilterGridHeight(),
            overflow: "hidden",
          },
        }}
      >
        <CharacterPickResultLines
          result={exportStatus}
          includeSpecs={includeExportSpecs}
          includeGearScore={includeExportGearScore}
          onIncludeSpecsChange={setIncludeExportSpecs}
          onIncludeGearScoreChange={setIncludeExportGearScore}
        />
      </Box>
    </Box>
  );
}
