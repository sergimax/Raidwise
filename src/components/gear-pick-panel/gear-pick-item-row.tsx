import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { memo, useCallback } from "react";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { GearPickItem } from "../../utils/build-gear-pick-items.ts";
import {
  summarizeSoftCompetition,
  type ItemSoftAssignment,
  type SoftRollMax,
  type SoftRollSystem,
} from "../../utils/gear-pick-soft-roll.ts";
import { WowItemLink } from "../wow-item-link/index.tsx";
import { GearPickCompetitionEditor } from "./gear-pick-competition-editor.tsx";
import { SoftStepper } from "./soft-stepper.tsx";

type GearPickItemRowProps = {
  item: GearPickItem;
  assignment: ItemSoftAssignment;
  maxSofts: SoftRollMax;
  system: SoftRollSystem;
  remainingBudgetForItem: number;
  itemLabel: string;
  onMySoftsChange: (itemId: number, mySofts: number) => void;
  onOthersCountChange: (itemId: number, weight: number, count: number) => void;
  onClearAssignment: (itemId: number) => void;
};

function areGearPickItemRowPropsEqual(
  previous: GearPickItemRowProps,
  next: GearPickItemRowProps,
): boolean {
  return (
    previous.item === next.item &&
    previous.assignment === next.assignment &&
    previous.maxSofts === next.maxSofts &&
    previous.system === next.system &&
    previous.remainingBudgetForItem === next.remainingBudgetForItem &&
    previous.itemLabel === next.itemLabel &&
    previous.onMySoftsChange === next.onMySoftsChange &&
    previous.onOthersCountChange === next.onOthersCountChange &&
    previous.onClearAssignment === next.onClearAssignment
  );
}

export const GearPickItemRow = memo(function GearPickItemRow({
  item,
  assignment,
  maxSofts,
  system,
  remainingBudgetForItem,
  itemLabel,
  onMySoftsChange,
  onOthersCountChange,
  onClearAssignment,
}: GearPickItemRowProps) {
  const { t } = useTranslation();
  const competition = summarizeSoftCompetition(assignment, system, maxSofts);
  const assignmentDirty =
    assignment.mySofts > 0 ||
    Object.keys(assignment.othersByWeight).length > 0;

  const handleMySoftsChange = useCallback(
    (mySofts: number) => {
      onMySoftsChange(item.itemId, mySofts);
    },
    [item.itemId, onMySoftsChange],
  );

  const handleOthersCountChange = useCallback(
    (weight: number, count: number) => {
      onOthersCountChange(item.itemId, weight, count);
    },
    [item.itemId, onOthersCountChange],
  );

  const handleClearAssignment = useCallback(() => {
    onClearAssignment(item.itemId);
  }, [item.itemId, onClearAssignment]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        columnGap: 1,
        rowGap: 0.35,
        alignItems: "stretch",
        px: 0.25,
        py: 0.75,
        borderBottom: 1,
        borderColor: "divider",
        "&:last-child": {
          borderBottom: 0,
        },
      }}
    >
      {/* Player softs — full-height left column */}
      <Stack
        direction="row"
        sx={{
          gridRow: "1 / span 2",
          alignSelf: "stretch",
          alignItems: "center",
          justifyContent: "center",
          px: 0.5,
          minHeight: "100%",
          color: competition.mySoftsDominated ? "warning.main" : "inherit",
        }}
      >
        <SoftStepper
          value={assignment.mySofts}
          min={0}
          max={remainingBudgetForItem}
          onChange={handleMySoftsChange}
          decreaseAria={t("gearPickPanel.decreaseMySoftsAria", { item: itemLabel })}
          increaseAria={t("gearPickPanel.increaseMySoftsAria", { item: itemLabel })}
          valueAria={t("gearPickPanel.mySoftsAria", { item: itemLabel })}
          emphasized
        />
      </Stack>

      {/* Line 1: type · item · boss · (raid right) */}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          gridColumn: 2,
          alignItems: "center",
          flexWrap: "wrap",
          minWidth: 0,
          columnGap: 0.75,
        }}
      >
        <Chip
          size="small"
          label={
            item.kind === "bis"
              ? t("gearPickPanel.kindBis")
              : t("gearPickPanel.kindVariant")
          }
          color={item.kind === "bis" ? "warning" : "default"}
          variant="outlined"
          sx={{ height: 20, "& .MuiChip-label": { px: 0.6, fontSize: "0.65rem" } }}
        />
        <WowItemLink itemId={item.itemId} />
        {item.bossName ? (
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
            {item.bossName}
          </Typography>
        ) : null}
        {item.raidLabel ? (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ lineHeight: 1.2, ml: "auto", flexShrink: 0 }}
          >
            {item.raidLabel}
          </Typography>
        ) : null}
      </Stack>

      {/* Reset — full-height right column */}
      <Stack
        direction="row"
        sx={{
          gridRow: "1 / span 2",
          gridColumn: 3,
          alignSelf: "stretch",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
        }}
      >
        <Tooltip title={t("gearPickPanel.resetItemSoftAssignments")}>
          <span>
            <IconButton
              size="small"
              color="inherit"
              disabled={!assignmentDirty}
              aria-label={t("gearPickPanel.resetItemSoftAssignmentsAria", {
                item: itemLabel,
              })}
              onClick={handleClearAssignment}
              sx={{ p: 0.35 }}
            >
              <RestartAltIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <GearPickCompetitionEditor
        assignment={assignment}
        competition={competition}
        itemLabel={itemLabel}
        maxSofts={maxSofts}
        system={system}
        remainingBudgetForItem={remainingBudgetForItem}
        onOthersCountChange={handleOthersCountChange}
      />
    </Box>
  );
}, areGearPickItemRowPropsEqual);
