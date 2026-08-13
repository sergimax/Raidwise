import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { memo, useCallback } from "react";
import type { TranslateFn } from "../../i18n/translate.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { GearPickItem } from "../../utils/build-gear-pick-items.ts";
import {
  softCompetitionDemandColor,
  softCompetitionDemandTone,
  softWeightKeys,
  summarizeSoftCompetition,
  type ItemSoftAssignment,
  type SoftCompetitionDemandTone,
  type SoftRollMax,
  type SoftRollSystem,
} from "../../utils/gear-pick-soft-roll.ts";
import { WowItemLink } from "../wow-item-link/index.tsx";

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

function SoftStepper({
  value,
  min,
  max,
  onChange,
  decreaseAria,
  increaseAria,
  valueAria,
  emphasized = false,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  decreaseAria: string;
  increaseAria: string;
  valueAria: string;
  emphasized?: boolean;
}) {
  return (
    <Stack direction="row" spacing={0} sx={{ alignItems: "center" }}>
      <IconButton
        size="small"
        aria-label={decreaseAria}
        disabled={value <= min}
        onClick={() => {
          onChange(value - 1);
        }}
        sx={{ p: emphasized ? 0.35 : 0.2 }}
      >
        <RemoveIcon sx={{ fontSize: emphasized ? 18 : 15 }} />
      </IconButton>
      <Typography
        variant={emphasized ? "body2" : "caption"}
        component="span"
        aria-label={valueAria}
        sx={{
          minWidth: emphasized ? 22 : 14,
          textAlign: "center",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        aria-label={increaseAria}
        disabled={value >= max}
        onClick={() => {
          onChange(value + 1);
        }}
        sx={{ p: emphasized ? 0.35 : 0.2 }}
      >
        <AddIcon sx={{ fontSize: emphasized ? 18 : 15 }} />
      </IconButton>
    </Stack>
  );
}

function competitionCaption(
  competition: ReturnType<typeof summarizeSoftCompetition>,
  maxSofts: SoftRollMax,
  t: TranslateFn,
): { text: string; hint: string; demandTone: SoftCompetitionDemandTone } {
  const belowMax = Math.max(1, maxSofts - 1);
  const demandTone = softCompetitionDemandTone(competition);

  if (competition.system === "reroll") {
    return {
      text: t("gearPickPanel.competitionReroll", {
        myRolls: competition.myRollCount,
        otherRolls: competition.othersRollCount,
        callers: competition.competingCallers,
      }),
      hint: t("gearPickPanel.competitionRerollHint", {
        myRolls: competition.myRollCount,
        mySofts: competition.mySofts,
        callers: competition.competingCallers,
        weight: competition.competingWeight,
        otherRolls: competition.othersRollCount,
      }),
      demandTone,
    };
  }

  const plus100Hint = t("gearPickPanel.competitionPlus100Hint", {
    max: maxSofts,
    belowMax,
  });

  if (competition.mySoftsDominated) {
    return {
      text: t("gearPickPanel.competitionPlus100Dominated", {
        my: competition.mySofts,
        max: maxSofts,
        count: competition.maxSoftCallerCount,
      }),
      hint: plus100Hint,
      demandTone,
    };
  }

  if (competition.maxSoftCallerCount > 0) {
    return {
      text: t("gearPickPanel.competitionPlus100MaxCaller", {
        max: maxSofts,
        count: competition.maxSoftCallerCount,
      }),
      hint: plus100Hint,
      demandTone,
    };
  }

  return {
    text: t("gearPickPanel.competitionPlus100", {
      my: competition.mySofts,
      weight: competition.competingWeight,
      callers: competition.competingCallers,
    }),
    hint: plus100Hint,
    demandTone,
  };
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
  const weightKeys = softWeightKeys(maxSofts);
  const caption = competitionCaption(competition, maxSofts, t);
  const demandColor = softCompetitionDemandColor(caption.demandTone);
  const hasMaxSoftCaller = competition.maxSoftCallerCount > 0;
  const demandEmphasized =
    caption.demandTone === "medium" ||
    caption.demandTone === "high" ||
    caption.demandTone === "blocked";
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

      {/* Line 2: others softs · competition */}
      <Stack
        direction="row"
        sx={{
          gridColumn: 2,
          alignItems: "center",
          flexWrap: "wrap",
          columnGap: 0.75,
          rowGap: 0.35,
          minWidth: 0,
        }}
      >
        <Stack
          direction="row"
          aria-label={t("gearPickPanel.othersTitle")}
          sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}
        >
          {weightKeys.map((weight) => {
            const count = assignment.othersByWeight[weight] ?? 0;
            const isMaxWeight = weight === maxSofts;
            const dominatedWeight =
              system === "plus100" && hasMaxSoftCaller && !isMaxWeight;
            const noCallers = count === 0;
            return (
              <Stack
                key={weight}
                direction="row"
                spacing={0}
                sx={{
                  alignItems: "stretch",
                  border: 1,
                  borderColor:
                    isMaxWeight && hasMaxSoftCaller
                      ? "warning.main"
                      : noCallers
                        ? "action.disabledBackground"
                        : "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                  opacity: noCallers ? 0.4 : dominatedWeight ? 0.55 : 1,
                  color: noCallers ? "text.disabled" : "inherit",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 0.75,
                    fontWeight: 700,
                    lineHeight: 1,
                    bgcolor: noCallers ? "action.hover" : "action.selected",
                    borderRight: 1,
                    borderColor: "divider",
                    textDecoration: dominatedWeight ? "line-through" : "none",
                  }}
                >
                  {t("gearPickPanel.othersWeightLabel", { weight })}
                </Typography>
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    px: 0.25,
                    bgcolor: noCallers ? "action.hover" : "background.paper",
                  }}
                >
                  <SoftStepper
                    value={count}
                    min={0}
                    max={99}
                    onChange={(next) => {
                      handleOthersCountChange(weight, next);
                    }}
                    decreaseAria={t("gearPickPanel.decreaseOthersAria", {
                      weight,
                      item: itemLabel,
                    })}
                    increaseAria={t("gearPickPanel.increaseOthersAria", {
                      weight,
                      item: itemLabel,
                    })}
                    valueAria={t("gearPickPanel.othersWeightAria", {
                      weight,
                      item: itemLabel,
                    })}
                  />
                </Stack>
              </Stack>
            );
          })}
        </Stack>

        <Tooltip title={caption.hint}>
          <Typography
            variant="caption"
            color={demandColor}
            sx={{
              lineHeight: 1.2,
              fontWeight: demandEmphasized ? 700 : 600,
              borderBottom: "1px dotted",
              borderColor: "currentColor",
              cursor: "help",
            }}
          >
            {caption.text}
          </Typography>
        </Tooltip>
      </Stack>
    </Box>
  );
}, areGearPickItemRowPropsEqual);
