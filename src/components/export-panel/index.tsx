import { Box } from "@mui/material";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import type { CharacterRecord } from "../../types/characters.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  buildClearAllExportSpecSelection,
  buildSelectAllExportSpecSelection,
  clearUnavailableExportSpecSelections,
  isCharacterIncludedInExport,
  resolveEffectiveExportSpecSelection,
  resolveExportSpecSelection,
  type CharacterExportSpecSelection,
} from "../../utils/format-character-export.ts";
import {
  buildExportStatus,
  hasCharacterWithoutCdInVisibleDungeons,
} from "../../utils/build-export-status.ts";
import {
  EXPORT_MIN_GS_COMPACT_DEFAULT,
  resolveExportMinGearScoreThreshold,
} from "../../utils/parse-export-min-gear-score.ts";
import { ExportCharacterSpecFilter } from "./export-character-spec-filter.tsx";
import { ExportCharacterSpecFilterActions } from "./export-character-spec-filter-actions.tsx";
import { ExportDungeonFilter } from "./export-dungeon-filter.tsx";
import { ExportFilterBlock } from "./export-filter-block.tsx";
import { ExportFilterSection } from "./export-filter-section.tsx";
import { ExportMinGearScoreFilter } from "./export-min-gear-score-filter.tsx";
import { ExportRoleFilterPanel } from "./export-role-filter.tsx";
import { ExportResultLines } from "./export-result-lines.tsx";
import {
  EXPORT_FILTER_GRID_GAP_SPACING,
  EXPORT_PANEL_SIDE_BY_SIDE_MQ_KEY,
  getExportFilterGridHeight,
  getExportFilterGridTemplateAreas,
  getExportFilterGridTemplateColumns,
  getExportFilterGridTemplateRows,
  getExportResultColumnMinWidth,
} from "./constants.ts";
import type { ExportPanelProps } from "./types.ts";
import {
  DEFAULT_EXPORT_ROLE_FILTER,
  type ExportRoleFilter,
} from "../../utils/export-spec-role.ts";

type StoredExportSpecSelection = Partial<CharacterExportSpecSelection>;

export type ExportPanelHandle = {
  resetAllFilters: () => void;
};

export const ExportPanel = forwardRef<ExportPanelHandle, ExportPanelProps>(
  function ExportPanel(
    {
      characters,
      visibleDungeons,
      dungeonToggles,
      dungeonNameSearch,
      onDungeonNameSearchChange,
      totalDungeonCount,
    },
    ref,
  ) {
    const { t, locale } = useTranslation();
    const [exportSpecSelectionByCharacterId, setExportSpecSelectionByCharacterId] =
      useState<Record<string, StoredExportSpecSelection>>({});
    const [minGearScoreFilterEnabled, setMinGearScoreFilterEnabled] = useState(false);
    const [minGearScoreCompact, setMinGearScoreCompact] = useState(
      EXPORT_MIN_GS_COMPACT_DEFAULT,
    );
    const [roleFilter, setRoleFilter] = useState<ExportRoleFilter>(
      () => ({ ...DEFAULT_EXPORT_ROLE_FILTER }),
    );

    const hasDungeonFilter = totalDungeonCount > 0;

    const minGearScore = useMemo(
      () =>
        resolveExportMinGearScoreThreshold(minGearScoreFilterEnabled, minGearScoreCompact),
      [minGearScoreCompact, minGearScoreFilterEnabled],
    );

    const includedCharacterIds = useMemo(
      () =>
        new Set(
          characters
            .filter((character) =>
              hasCharacterWithoutCdInVisibleDungeons(
                character.id,
                visibleDungeons,
                dungeonToggles,
              ),
            )
            .map((character) => character.id),
        ),
      [characters, dungeonToggles, visibleDungeons],
    );

    const exportSpecSelectionForPanel = useMemo(
      () =>
        clearUnavailableExportSpecSelections(
          characters,
          exportSpecSelectionByCharacterId,
          includedCharacterIds,
        ),
      [characters, exportSpecSelectionByCharacterId, includedCharacterIds],
    );

    const resetAllFilters = () => {
      setExportSpecSelectionByCharacterId({});
      setMinGearScoreFilterEnabled(false);
      setMinGearScoreCompact(EXPORT_MIN_GS_COMPACT_DEFAULT);
      setRoleFilter({ ...DEFAULT_EXPORT_ROLE_FILTER });
    };

    const selectAllCharacterSpecs = () => {
      setExportSpecSelectionByCharacterId(
        buildSelectAllExportSpecSelection(characters, includedCharacterIds),
      );
    };

    const clearAllCharacterSpecs = () => {
      setExportSpecSelectionByCharacterId(buildClearAllExportSpecSelection(characters));
    };

    useImperativeHandle(ref, () => ({ resetAllFilters }), []);

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
          dungeons: visibleDungeons,
          dungeonToggles,
          exportSpecSelectionByCharacterId: exportSpecSelectionForPanel,
          minGearScore,
          roleFilter,
          locale,
          t,
        }),
      [
        dungeonToggles,
        exportSpecSelectionForPanel,
        includedCharacters,
        locale,
        minGearScore,
        roleFilter,
        t,
        visibleDungeons,
      ],
    );

    const setSpecIncluded = (
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
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: EXPORT_FILTER_GRID_GAP_SPACING,
          alignItems: "stretch",
          width: "100%",
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
            flexShrink: 0,
          }}
        >
          <ExportFilterBlock gridArea="gearScore">
            <ExportFilterSection
              step={2}
              title={t("exportPanel.gearScoreFilterTitle")}
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
              step={2}
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
              step={2}
              title={t("exportPanel.characterSpecsFilterTitle")}
              description={t("exportPanel.characterSpecsFilterHelper")}
              titleActions={
                <ExportCharacterSpecFilterActions
                  disabled={characters.length === 0}
                  onSelectAll={selectAllCharacterSpecs}
                  onClearAll={clearAllCharacterSpecs}
                />
              }
            >
              <ExportCharacterSpecFilter
                includedCharacterIds={includedCharacterIds}
                characters={characters}
                exportSpecSelectionByCharacterId={exportSpecSelectionForPanel}
                roleFilter={roleFilter}
                minGearScore={minGearScore}
                onSpecIncluded={setSpecIncluded}
              />
            </ExportFilterSection>
          </ExportFilterBlock>

          {hasDungeonFilter ? (
            <ExportFilterBlock gridArea="dungeon">
              <ExportFilterSection
                step={1}
                title={t("exportPanel.dungeonFilterTitle")}
                description={t("exportPanel.dungeonFilterHelper")}
              >
                <ExportDungeonFilter
                  dungeonNameSearch={dungeonNameSearch}
                  onDungeonNameSearchChange={onDungeonNameSearchChange}
                  visibleDungeons={visibleDungeons}
                  totalDungeonCount={totalDungeonCount}
                  locale={locale}
                  t={t}
                />
              </ExportFilterSection>
            </ExportFilterBlock>
          ) : null}
        </Box>

        <Box
          sx={{
            flex: "none",
            minWidth: 0,
            width: "100%",
            [EXPORT_PANEL_SIDE_BY_SIDE_MQ_KEY]: {
              flex: "1 1 auto",
              display: "flex",
              flexDirection: "column",
              minWidth: getExportResultColumnMinWidth(),
              minHeight: 0,
              height: getExportFilterGridHeight(),
              maxHeight: getExportFilterGridHeight(),
              overflow: "hidden",
            },
          }}
        >
          <ExportResultLines result={exportStatus} />
        </Box>
      </Box>
    );
  },
);
