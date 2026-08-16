import { Box, Stack } from "@mui/material";
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
import { ExportCharacterSpecFilter } from "./export-character-spec-filter.tsx";
import { ExportCharacterSpecFilterActions } from "./export-character-spec-filter-actions.tsx";
import { ExportDungeonFilter } from "./export-dungeon-filter.tsx";
import { ExportDungeonFilterActions } from "./export-dungeon-filter-actions.tsx";
import { ExportFilterBlock } from "./export-filter-block.tsx";
import { ExportFilterSection } from "./export-filter-section.tsx";
import { ExportMinGearScoreFilter } from "./export-min-gear-score-filter.tsx";
import { ExportRoleFilterPanel } from "./export-role-filter.tsx";
import { ExportResultLines } from "./export-result-lines.tsx";
import {
  exportDungeonFilterContentSx,
  EXPORT_FILTER_GRID_GAP_SPACING,
  EXPORT_PANEL_SIDE_BY_SIDE_MQ_KEY,
  getExportFilterGridHeight,
  getExportFilterGridTemplateAreas,
  getExportFilterGridTemplateColumns,
  getExportFilterGridTemplateRows,
  getExportResultColumnMinWidth,
} from "./constants.ts";
import type { ExportPanelProps } from "./types.ts";

export function ExportPanel({
  characters,
  visibleDungeons,
  dungeonToggles,
  dungeonNameSearch,
  onDungeonNameSearchChange,
  totalDungeonCount,
  session,
}: ExportPanelProps) {
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
        gap: EXPORT_FILTER_GRID_GAP_SPACING,
        alignItems: "stretch",
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        [EXPORT_PANEL_SIDE_BY_SIDE_MQ_KEY]: {
          flexDirection: "row",
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: getExportFilterGridTemplateColumns(),
          },
          gridTemplateRows: {
            xs: "auto",
            md: getExportFilterGridTemplateRows(),
          },
          gridTemplateAreas: {
            xs: "none",
            md: getExportFilterGridTemplateAreas(hasDungeonFilter),
          },
          gap: EXPORT_FILTER_GRID_GAP_SPACING,
          alignItems: "stretch",
          width: { xs: "100%", md: "fit-content" },
          maxWidth: "100%",
          // Shrink with the Paper instead of forcing results past the right edge.
          flexShrink: 1,
          minWidth: 0,
        }}
      >
        {hasDungeonFilter ? (
          <ExportFilterBlock gridArea="dungeon">
            <ExportFilterSection
              step={1}
              title={t("exportPanel.dungeonFilterTitle")}
              titleMark={t("exportPanel.dungeonFilterTotalMark", {
                total: totalDungeonCount,
              })}
              description={t("exportPanel.dungeonFilterHelper")}
              titleActions={
                <ExportDungeonFilterActions
                  disabled={!dungeonFilterDirty}
                  onReset={resetDungeonFilter}
                />
              }
              contentSx={exportDungeonFilterContentSx}
            >
              <ExportDungeonFilter
                dungeonNameSearch={dungeonNameSearch}
                onDungeonNameSearchChange={onDungeonNameSearchChange}
                visibleDungeons={visibleDungeons}
                excludedDungeonIds={excludedDungeonIds}
                onToggleDungeonExcluded={toggleDungeonExcluded}
                locale={locale}
                t={t}
              />
            </ExportFilterSection>
          </ExportFilterBlock>
        ) : null}

        <ExportFilterBlock gridArea="gearScore">
          <ExportFilterSection
            step={2}
            title={t("exportPanel.gearScoreFilterTitle")}
            titleMark={t("common.optional")}
            description={t("exportPanel.minGearScoreHelper")}
            contentSx={{ overflow: "visible" }}
          >
            <ExportMinGearScoreFilter
              enabled={minGearScoreFilterEnabled}
              compactValue={minGearScoreCompact}
              onEnabledChange={setMinGearScoreFilterEnabled}
              onCompactValueChange={setMinGearScoreCompact}
            />
          </ExportFilterSection>
        </ExportFilterBlock>

        <ExportFilterBlock gridArea="role">
          <ExportFilterSection
            step={3}
            title={t("exportPanel.roleFilterTitle")}
            description={t("exportPanel.roleFilterHelper")}
          >
            <ExportRoleFilterPanel
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
            />
          </ExportFilterSection>
        </ExportFilterBlock>

        <ExportFilterBlock gridArea="characterSpecs">
          <ExportFilterSection
            step={4}
            title={t("exportPanel.characterSpecsFilterTitle")}
            description={t("exportPanel.characterSpecsFilterHelper")}
            titleActions={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <GearPickCharacterFilterActions
                  onlyWithUpgrades={onlyCharactersWithUpgrades}
                  onOnlyWithUpgradesChange={setOnlyCharactersWithUpgrades}
                />
                <ExportCharacterSpecFilterActions
                  disabled={characters.length === 0}
                  onSelectAll={() =>
                    selectAllCharacterSpecs(characters, selectableCharacterIds)
                  }
                  onClearAll={() => clearAllCharacterSpecs(characters)}
                />
              </Stack>
            }
          >
            <ExportCharacterSpecFilter
              includedCharacterIds={availableCharacterIds}
              charactersWithUpgradesIds={charactersWithUpgradesIds}
              onlyWithUpgrades={onlyCharactersWithUpgrades}
              characters={characters}
              exportSpecSelectionByCharacterId={exportSpecSelectionForPanel}
              roleFilter={roleFilter}
              minGearScore={minGearScore}
              onSpecIncluded={setSpecIncluded}
            />
          </ExportFilterSection>
        </ExportFilterBlock>
      </Box>

      <Box
        sx={{
          flex: "none",
          minWidth: 0,
          width: "100%",
          maxWidth: "100%",
          [EXPORT_PANEL_SIDE_BY_SIDE_MQ_KEY]: {
            // Prefer 2-unit width; allow shrink so the column stays inside Paper padding.
            flex: "1 1 auto",
            flexBasis: getExportResultColumnMinWidth(),
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0,
            height: getExportFilterGridHeight(),
            maxHeight: getExportFilterGridHeight(),
            overflow: "hidden",
          },
        }}
      >
        <ExportResultLines
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
