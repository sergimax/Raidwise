import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import { getWotlkItemName } from "../../data/wotlk-item-names.ts";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import type { GearPickSessionState } from "../../hooks/use-gear-pick-session-state.ts";
import { useItemTooltipLocale } from "../../hooks/use-item-tooltip-locale.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { CharacterRecord } from "../../types/characters.ts";
import type { DungeonRecord, DungeonToggles } from "../../types/dungeons.ts";
import { hasCharacterWithoutCdInVisibleDungeons } from "../../utils/build-export-status.ts";
import {
  buildGearPickItems,
  characterHasGearPickUpgrades,
} from "../../utils/build-gear-pick-items.ts";
import {
  emptySoftAssignment,
  formatGearPickCopyText,
  remainingSoftBudget,
  sumMySofts,
} from "../../utils/gear-pick-soft-roll.ts";
import { filterDungeonsExcludingIds } from "../../utils/filter-dungeons-excluding-ids.ts";
import { DungeonFilter } from "../filter-unit/dungeon-filter.tsx";
import { DungeonFilterActions } from "../filter-unit/dungeon-filter-actions.tsx";
import { FilterSection } from "../filter-unit/filter-section.tsx";
import {
  FILTER_UNIT_GRID_GAP_SPACING,
  dungeonFilterContentSx,
} from "../filter-unit/constants.ts";
import {
  getGearPickGridTemplateAreas,
  getGearPickGridTemplateColumns,
  getGearPickGridTemplateRows,
  getGearPickMdContainerMqKey,
  getGearPickWideContainerMqKey,
} from "./constants.ts";
import { GearPickCharacterSelect } from "./gear-pick-character-select.tsx";
import { GearPickCharacterFilterActions } from "./gear-pick-character-filter-actions.tsx";
import { GearPickCopyBlock } from "./gear-pick-copy-block.tsx";
import { GearPickEmptyNoGear } from "./gear-pick-empty-no-gear.tsx";
import { GearPickFilterBlock } from "./gear-pick-filter-block.tsx";
import { GearPickItemRow } from "./gear-pick-item-row.tsx";
import { GearPickItemsActions } from "./gear-pick-items-actions.tsx";
import { GearPickRules } from "./gear-pick-rules.tsx";

export type GearPickPanelProps = {
  characters: readonly CharacterRecord[];
  visibleDungeons: readonly DungeonRecord[];
  dungeonToggles: DungeonToggles;
  dungeonNameSearch: string;
  onDungeonNameSearchChange: (query: string) => void;
  totalDungeonCount: number;
  session: GearPickSessionState;
};

export function GearPickPanel({
  characters,
  visibleDungeons,
  dungeonToggles,
  dungeonNameSearch,
  onDungeonNameSearchChange,
  totalDungeonCount,
  session,
}: GearPickPanelProps) {
  const { t, locale } = useTranslation();
  const { locale: itemLocale } = useItemTooltipLocale();
  const { getBisSlotMapForSpec } = useBisListsContext();

  const {
    selection,
    rules,
    assignmentsByItemId,
    excludedDungeonIds,
    handleSelectionChange,
    handleRulesChange,
    handleMySoftsChange,
    handleOthersCountChange,
    handleClearItemAssignment,
    toggleDungeonExcluded,
    clearExcludedDungeonIds,
    pruneAssignmentsToItemIds,
    clearAssignments,
    includeCopyCharacterName,
    compactCopyLines,
    onlyCharactersWithUpgrades,
    setIncludeCopyCharacterName,
    setCompactCopyLines,
    setOnlyCharactersWithUpgrades,
  } = session;

  const activeDungeons = useMemo(
    () => filterDungeonsExcludingIds(visibleDungeons, excludedDungeonIds),
    [excludedDungeonIds, visibleDungeons],
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

  /** Ignore a stored pick when that character is on CD or dimmed by the upgrades filter. */
  const activeSelection =
    selection !== null &&
    availableCharacterIds.has(selection.characterId) &&
    (!onlyCharactersWithUpgrades ||
      charactersWithUpgradesIds.has(selection.characterId))
      ? selection
      : null;

  const selectedCharacter = useMemo(
    () =>
      activeSelection
        ? characters.find((character) => character.id === activeSelection.characterId)
        : undefined,
    [characters, activeSelection],
  );

  const selectedSpecGear =
    activeSelection && selectedCharacter
      ? activeSelection.side === "main"
        ? selectedCharacter.mainSpec
        : selectedCharacter.offSpec
      : undefined;

  const gearPickItems = useMemo(() => {
    if (!selectedCharacter || !activeSelection || !selectedSpecGear) {
      return [];
    }
    return buildGearPickItems({
      character: selectedCharacter,
      specSide: activeSelection.side,
      dungeons: activeDungeons,
      getBisSlotMapForSpec,
      locale,
    });
  }, [
    activeDungeons,
    getBisSlotMapForSpec,
    locale,
    selectedCharacter,
    selectedSpecGear,
    activeSelection,
  ]);

  // Free soft budget for items that left the list (excluded / filtered raids).
  // Skip when selection is inactive so CD-all-raids does not wipe session softs.
  useEffect(() => {
    if (!activeSelection) {
      return;
    }
    pruneAssignmentsToItemIds(
      new Set(gearPickItems.map((item) => item.itemId)),
    );
  }, [activeSelection, gearPickItems, pruneAssignmentsToItemIds]);

  const softBudgetUsed = sumMySofts(assignmentsByItemId);

  const emptyItemsState = useMemo((): "noSelection" | "noGear" | "noBis" | "noItems" | null => {
    if (!activeSelection || !selectedCharacter) {
      return "noSelection";
    }
    if (!selectedSpecGear) {
      return "noSelection";
    }
    if (!selectedSpecGear.gearItems || selectedSpecGear.gearItems.length === 0) {
      return "noGear";
    }
    const className = selectedCharacter.class?.name;
    if (!className) {
      return "noSelection";
    }
    const bisMap = getBisSlotMapForSpec(className, selectedSpecGear.spec);
    if (bisMap.size === 0) {
      return "noBis";
    }
    if (gearPickItems.length === 0) {
      return "noItems";
    }
    return null;
  }, [
    activeSelection,
    gearPickItems.length,
    getBisSlotMapForSpec,
    selectedCharacter,
    selectedSpecGear,
  ]);

  const copyItems = useMemo(() => {
    return gearPickItems
      .map((item) => {
        const mySofts = assignmentsByItemId[item.itemId]?.mySofts ?? 0;
        if (mySofts <= 0) {
          return null;
        }
        return {
          itemName:
            getWotlkItemName(item.itemId, itemLocale) ?? `#${item.itemId}`,
          bossName: item.bossName,
          mySofts,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }, [assignmentsByItemId, gearPickItems, itemLocale]);

  const copyText = useMemo(
    () =>
      formatGearPickCopyText({
        characterName: selectedCharacter?.name,
        items: copyItems,
        includeCharacterName: includeCopyCharacterName,
        compactLines: compactCopyLines,
      }),
    [
      compactCopyLines,
      copyItems,
      includeCopyCharacterName,
      selectedCharacter?.name,
    ],
  );

  const defaultAssignment = useMemo(() => emptySoftAssignment(), []);

  const resetDungeonFilter = () => {
    onDungeonNameSearchChange("");
    clearExcludedDungeonIds();
  };

  const dungeonFilterDirty =
    dungeonNameSearch.trim() !== "" || excludedDungeonIds.size > 0;

  const softAssignmentsDirty = Object.values(assignmentsByItemId).some(
    (assignment) =>
      assignment.mySofts > 0 ||
      Object.keys(assignment.othersByWeight).length > 0,
  );

  return (
    <Box sx={{ containerType: "inline-size", width: "100%", minWidth: 0 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: getGearPickGridTemplateColumns("filters"),
          },
          gridTemplateRows: {
            xs: "auto",
            md: getGearPickGridTemplateRows("filters"),
          },
          gridTemplateAreas: {
            xs: "none",
            md: getGearPickGridTemplateAreas("filters"),
          },
          gap: FILTER_UNIT_GRID_GAP_SPACING,
          alignItems: "stretch",
          width: "100%",
          minWidth: 0,
          [getGearPickMdContainerMqKey()]: {
            gridTemplateColumns: getGearPickGridTemplateColumns("md"),
            gridTemplateRows: getGearPickGridTemplateRows("md"),
            gridTemplateAreas: getGearPickGridTemplateAreas("md"),
          },
          [getGearPickWideContainerMqKey()]: {
            gridTemplateColumns: getGearPickGridTemplateColumns("wide"),
            gridTemplateRows: getGearPickGridTemplateRows("wide"),
            gridTemplateAreas: getGearPickGridTemplateAreas("wide"),
          },
        }}
      >
      <GearPickFilterBlock gridArea="dungeon">
        <FilterSection
          step={1}
          title={t("gearPickPanel.dungeonFilterTitle")}
          titleMark={t("characterPickPanel.dungeonFilterTotalMark", {
            total: totalDungeonCount,
          })}
          description={t("gearPickPanel.dungeonFilterHelper")}
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
      </GearPickFilterBlock>

      <GearPickFilterBlock gridArea="characterSpecs">
        <FilterSection
          step={2}
          title={t("gearPickPanel.characterTitle")}
          description={t("gearPickPanel.characterHelper")}
          descriptionActions={
            <GearPickCharacterFilterActions
              onlyWithUpgrades={onlyCharactersWithUpgrades}
              onOnlyWithUpgradesChange={setOnlyCharactersWithUpgrades}
            />
          }
        >
          <GearPickCharacterSelect
            characters={characters}
            availableCharacterIds={availableCharacterIds}
            charactersWithUpgradesIds={charactersWithUpgradesIds}
            onlyWithUpgrades={onlyCharactersWithUpgrades}
            selection={activeSelection}
            onSelectionChange={handleSelectionChange}
            t={t}
          />
        </FilterSection>
      </GearPickFilterBlock>

      <GearPickFilterBlock gridArea="rules">
        <FilterSection
          step={3}
          title={t("gearPickPanel.rulesTitle")}
          description={t("gearPickPanel.rulesHelper")}
          contentSx={{ overflow: "visible" }}
        >
          <GearPickRules
            rules={rules}
            onRulesChange={handleRulesChange}
            softBudgetUsed={softBudgetUsed}
            t={t}
          />
        </FilterSection>
      </GearPickFilterBlock>

      <GearPickFilterBlock gridArea="softs">
        <FilterSection
          step={4}
          title={t("gearPickPanel.itemsTitle")}
          description={t("gearPickPanel.itemsHelper")}
          titleActions={
            <GearPickItemsActions
              disabled={!softAssignmentsDirty}
              onReset={clearAssignments}
            />
          }
          contentSx={{
            overflowY: "auto",
          }}
        >
          {emptyItemsState === "noGear" ? (
            <GearPickEmptyNoGear t={t} />
          ) : emptyItemsState ? (
            <Typography variant="body2" color="text.secondary">
              {emptyItemsState === "noSelection"
                ? t("gearPickPanel.itemsEmptyNoSelection")
                : emptyItemsState === "noBis"
                  ? t("gearPickPanel.itemsEmptyNoBis")
                  : t("gearPickPanel.itemsEmptyNoItems")}
            </Typography>
          ) : (
            <Stack spacing={0}>
              {gearPickItems.map((item) => {
                const assignment =
                  assignmentsByItemId[item.itemId] ?? defaultAssignment;
                const itemLabel =
                  getWotlkItemName(item.itemId, itemLocale) ?? `#${item.itemId}`;
                const budgetForItem = remainingSoftBudget(
                  assignmentsByItemId,
                  rules.maxSofts,
                  item.itemId,
                );

                return (
                  <GearPickItemRow
                    key={item.itemId}
                    item={item}
                    assignment={assignment}
                    maxSofts={rules.maxSofts}
                    system={rules.system}
                    remainingBudgetForItem={budgetForItem}
                    itemLabel={itemLabel}
                    onMySoftsChange={handleMySoftsChange}
                    onOthersCountChange={handleOthersCountChange}
                    onClearAssignment={handleClearItemAssignment}
                  />
                );
              })}
            </Stack>
          )}
        </FilterSection>
      </GearPickFilterBlock>

      <GearPickFilterBlock gridArea="copy" copyBlockSized>
        <GearPickCopyBlock
          copyText={copyText}
          hasSoftCalls={copyItems.length > 0}
          includeCharacterName={includeCopyCharacterName}
          compactLines={compactCopyLines}
          onIncludeCharacterNameChange={setIncludeCopyCharacterName}
          onCompactLinesChange={setCompactCopyLines}
          t={t}
        />
      </GearPickFilterBlock>
      </Box>
    </Box>
  );
}
