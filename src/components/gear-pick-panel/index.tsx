import { Box, Stack, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { getWotlkItemName } from "../../data/wotlk-item-names.ts";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import { useItemTooltipLocale } from "../../hooks/use-item-tooltip-locale.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { CharacterRecord } from "../../types/characters.ts";
import type { DungeonRecord, DungeonToggles } from "../../types/dungeons.ts";
import { hasCharacterWithoutCdInVisibleDungeons } from "../../utils/build-export-status.ts";
import { buildGearPickItems } from "../../utils/build-gear-pick-items.ts";
import {
  clampAssignmentsToMaxSofts,
  DEFAULT_SOFT_ROLL_RULES,
  emptySoftAssignment,
  formatGearPickCopyText,
  remainingSoftBudget,
  setMySoftsForItem,
  setOthersCountForWeight,
  sumMySofts,
  type SoftAssignmentByItemId,
  type SoftRollRules,
} from "../../utils/gear-pick-soft-roll.ts";
import {
  ExportDungeonFilter,
  exportDungeonFilterContentSx,
} from "../export-panel/export-dungeon-filter.tsx";
import { ExportFilterSection } from "../export-panel/export-filter-section.tsx";
import { EXPORT_FILTER_GRID_GAP_SPACING } from "../export-panel/constants.ts";
import {
  GEAR_PICK_SIDE_BY_SIDE_MQ_KEY,
  getGearPickGridTemplateAreas,
  getGearPickGridTemplateColumns,
  getGearPickGridTemplateRows,
} from "./constants.ts";
import {
  GearPickCharacterSelect,
  type GearPickCharacterSelection,
} from "./gear-pick-character-select.tsx";
import { GearPickCopyBlock } from "./gear-pick-copy-block.tsx";
import { GearPickEmptyNoGear } from "./gear-pick-empty-no-gear.tsx";
import { GearPickFilterBlock } from "./gear-pick-filter-block.tsx";
import { GearPickItemRow } from "./gear-pick-item-row.tsx";
import { GearPickRules } from "./gear-pick-rules.tsx";

export type GearPickPanelProps = {
  characters: readonly CharacterRecord[];
  visibleDungeons: readonly DungeonRecord[];
  dungeonToggles: DungeonToggles;
  dungeonNameSearch: string;
  onDungeonNameSearchChange: (query: string) => void;
  totalDungeonCount: number;
};

export function GearPickPanel({
  characters,
  visibleDungeons,
  dungeonToggles,
  dungeonNameSearch,
  onDungeonNameSearchChange,
  totalDungeonCount,
}: GearPickPanelProps) {
  const { t, locale } = useTranslation();
  const { locale: itemLocale } = useItemTooltipLocale();
  const { getBisSlotMapForSpec } = useBisListsContext();

  const [selection, setSelection] = useState<GearPickCharacterSelection | null>(
    null,
  );
  const [rules, setRules] = useState<SoftRollRules>(DEFAULT_SOFT_ROLL_RULES);
  const [assignmentsByItemId, setAssignmentsByItemId] =
    useState<SoftAssignmentByItemId>({});

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

  /** Ignore a stored pick when that character is on CD for every visible raid. */
  const activeSelection =
    selection !== null && includedCharacterIds.has(selection.characterId)
      ? selection
      : null;

  const handleSelectionChange = (next: GearPickCharacterSelection) => {
    setSelection(next);
    setAssignmentsByItemId({});
  };

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
      dungeons: visibleDungeons,
      getBisSlotMapForSpec,
      locale,
    });
  }, [
    getBisSlotMapForSpec,
    locale,
    selectedCharacter,
    selectedSpecGear,
    activeSelection,
    visibleDungeons,
  ]);

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
    () => formatGearPickCopyText({ items: copyItems }),
    [copyItems],
  );

  const handleRulesChange = (next: SoftRollRules) => {
    setRules(next);
    if (next.maxSofts !== rules.maxSofts) {
      setAssignmentsByItemId((previous) =>
        clampAssignmentsToMaxSofts(previous, next.maxSofts),
      );
    }
  };

  const handleMySoftsChange = useCallback(
    (itemId: number, mySofts: number) => {
      setAssignmentsByItemId((previous) =>
        setMySoftsForItem(previous, itemId, mySofts, rules.maxSofts),
      );
    },
    [rules.maxSofts],
  );

  const handleOthersCountChange = useCallback(
    (itemId: number, weight: number, count: number) => {
      setAssignmentsByItemId((previous) =>
        setOthersCountForWeight(previous, itemId, weight, count, rules.maxSofts),
      );
    },
    [rules.maxSofts],
  );

  const defaultAssignment = useMemo(() => emptySoftAssignment(), []);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: getGearPickGridTemplateColumns("md"),
        },
        gridTemplateRows: {
          xs: "auto",
          md: getGearPickGridTemplateRows("md"),
        },
        gridTemplateAreas: {
          xs: "none",
          md: getGearPickGridTemplateAreas("md"),
        },
        gap: EXPORT_FILTER_GRID_GAP_SPACING,
        alignItems: "stretch",
        width: "100%",
        [GEAR_PICK_SIDE_BY_SIDE_MQ_KEY]: {
          gridTemplateColumns: getGearPickGridTemplateColumns("wide"),
          gridTemplateRows: getGearPickGridTemplateRows("wide"),
          gridTemplateAreas: getGearPickGridTemplateAreas("wide"),
        },
      }}
    >
      <GearPickFilterBlock gridArea="dungeon">
        <ExportFilterSection
          step={1}
          title={t("gearPickPanel.dungeonFilterTitle")}
          description={t("gearPickPanel.dungeonFilterHelper")}
          contentSx={exportDungeonFilterContentSx}
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
      </GearPickFilterBlock>

      <GearPickFilterBlock gridArea="characterSpecs">
        <ExportFilterSection
          step={2}
          title={t("gearPickPanel.characterTitle")}
          description={t("gearPickPanel.characterHelper")}
        >
          <GearPickCharacterSelect
            characters={characters}
            includedCharacterIds={includedCharacterIds}
            selection={activeSelection}
            onSelectionChange={handleSelectionChange}
            t={t}
          />
        </ExportFilterSection>
      </GearPickFilterBlock>

      <GearPickFilterBlock gridArea="rules">
        <ExportFilterSection
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
        </ExportFilterSection>
      </GearPickFilterBlock>

      <GearPickFilterBlock gridArea="softs">
        <ExportFilterSection
          step={4}
          title={t("gearPickPanel.itemsTitle")}
          description={t("gearPickPanel.itemsHelper")}
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
                  />
                );
              })}
            </Stack>
          )}
        </ExportFilterSection>
      </GearPickFilterBlock>

      <GearPickFilterBlock gridArea="copy" copyBlockSized>
        <GearPickCopyBlock
          copyText={copyText}
          hasSoftCalls={copyItems.length > 0}
          t={t}
        />
      </GearPickFilterBlock>
    </Box>
  );
}
