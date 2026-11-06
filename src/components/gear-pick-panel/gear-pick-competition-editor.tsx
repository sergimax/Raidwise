import { Box, Stack, Tooltip, Typography } from "@mui/material";
import type { TranslateFn } from "../../i18n/translate.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  buildPlus100OddsAdvice,
  buildRerollOddsOptions,
  softCompetitionDemandColor,
  softCompetitionDemandTone,
  softWeightKeys,
  type ItemSoftAssignment,
  type SoftCompetitionDemandTone,
  type SoftRollMax,
  type SoftRollSystem,
  type summarizeSoftCompetition,
} from "../../utils/gear-pick-soft-roll.ts";
import { SoftStepper } from "./soft-stepper.tsx";

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
      hint: t(competition.competingCallers === 0 && competition.mySofts === 0
        ? "gearPickPanel.competitionRerollHintEmpty"
        : competition.ordinaryRollsCounted
          ? "gearPickPanel.competitionRerollHintSingle"
          : "gearPickPanel.competitionRerollHintMultiple", {
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

function SoftOddsCaption({
  system,
  maxSofts,
  mySofts,
  othersRollCount,
  othersByWeight,
  remainingBudgetForItem,
  t,
}: {
  system: SoftRollSystem;
  maxSofts: SoftRollMax;
  mySofts: number;
  othersRollCount: number;
  othersByWeight: ItemSoftAssignment["othersByWeight"];
  remainingBudgetForItem: number;
  t: TranslateFn;
}) {
  if (system === "reroll") {
    if (othersRollCount <= 0) {
      return null;
    }

    const options = buildRerollOddsOptions(othersByWeight, maxSofts);
    return (
      <Tooltip title={t("gearPickPanel.oddsRerollHint")}>
        <Typography
          variant="caption"
          component="span"
          sx={{
            lineHeight: 1.2,
            borderBottom: "1px dotted",
            borderColor: "text.disabled",
            cursor: "help",
            display: "inline-flex",
            flexWrap: "wrap",
            columnGap: 0.5,
            rowGap: 0.15,
          }}
        >
          {options.map((option, index) => {
            const selected = mySofts === option.softs;
            const affordable = option.softs <= remainingBudgetForItem;
            return (
              <Box
                key={option.softs}
                component="span"
                sx={{
                  color: selected
                    ? "success.main"
                    : affordable
                      ? "text.secondary"
                      : "text.disabled",
                  fontWeight: selected ? 700 : 500,
                  opacity: affordable || selected ? 1 : 0.55,
                }}
              >
                {t("gearPickPanel.oddsRerollOption", {
                  softs: option.softs,
                  chance: option.chancePercent,
                })}
                {index < options.length - 1 ? " ·" : ""}
              </Box>
            );
          })}
        </Typography>
      </Tooltip>
    );
  }

  const advice = buildPlus100OddsAdvice(othersByWeight, maxSofts);
  if (advice.softsToTie === null) {
    return null;
  }

  const tieAffordable = advice.softsToTie <= remainingBudgetForItem;
  const beatAffordable =
    advice.softsToBeat !== null &&
    advice.softsToBeat <= remainingBudgetForItem;

  const text =
    advice.softsToBeat === null
      ? t("gearPickPanel.oddsPlus100TieOnly", { softs: advice.softsToTie })
      : t("gearPickPanel.oddsPlus100TieAndBeat", {
          tie: advice.softsToTie,
          beat: advice.softsToBeat,
        });

  const selectedBeats =
    advice.softsToBeat !== null && mySofts >= advice.softsToBeat;
  const selectedTies =
    !selectedBeats && mySofts >= advice.softsToTie;

  return (
    <Tooltip title={t("gearPickPanel.oddsPlus100Hint")}>
      <Typography
        variant="caption"
        component="span"
        sx={{
          lineHeight: 1.2,
          fontWeight: selectedBeats || selectedTies ? 700 : 500,
          color: selectedBeats
            ? "success.main"
            : selectedTies
              ? "info.main"
              : tieAffordable || beatAffordable
                ? "text.secondary"
                : "text.disabled",
          borderBottom: "1px dotted",
          borderColor: "currentColor",
          cursor: "help",
        }}
      >
        {text}
      </Typography>
    </Tooltip>
  );
}

export function GearPickCompetitionEditor({
  assignment,
  competition,
  itemLabel,
  maxSofts,
  system,
  remainingBudgetForItem,
  onOthersCountChange,
}: {
  assignment: ItemSoftAssignment;
  competition: ReturnType<typeof summarizeSoftCompetition>;
  itemLabel: string;
  maxSofts: SoftRollMax;
  system: SoftRollSystem;
  remainingBudgetForItem: number;
  onOthersCountChange: (weight: number, count: number) => void;
}) {
  const { t } = useTranslation();
  const weightKeys = softWeightKeys(maxSofts);
  const caption = competitionCaption(competition, maxSofts, t);
  const demandColor = softCompetitionDemandColor(caption.demandTone);
  const hasMaxSoftCaller = competition.maxSoftCallerCount > 0;
  const demandEmphasized =
    caption.demandTone === "medium" ||
    caption.demandTone === "high" ||
    caption.demandTone === "blocked";

  return (
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
                    onOthersCountChange(weight, next);
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

      <SoftOddsCaption
        system={system}
        maxSofts={maxSofts}
        mySofts={assignment.mySofts}
        othersRollCount={competition.othersRollCount}
        othersByWeight={assignment.othersByWeight}
        remainingBudgetForItem={remainingBudgetForItem}
        t={t}
      />
    </Stack>
  );
}
