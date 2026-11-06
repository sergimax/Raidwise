import { Stack, Typography } from "@mui/material";
import { getWotlkItemName } from "../../data/wotlk-item-names.ts";
import type { GearPickSessionState } from "../../hooks/use-gear-pick-session-state.ts";
import { useItemTooltipLocale } from "../../hooks/use-item-tooltip-locale.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { GearPickItem } from "../../utils/build-gear-pick-items.ts";
import { emptySoftAssignment, remainingSoftBudget } from "../../utils/gear-pick-soft-roll.ts";
import { GearPickEmptyNoGear } from "./gear-pick-empty-no-gear.tsx";
import { GearPickItemRow } from "./gear-pick-item-row.tsx";

export type GearPickItemsEmptyReason = "noSelection" | "noGear" | "noBis" | "noItems";

type GearPickItemResultsProps = {
  gearPickItems: readonly GearPickItem[];
  emptyItemsState: GearPickItemsEmptyReason | null;
  session: Pick<GearPickSessionState, "assignmentsByItemId" | "rules" | "handleMySoftsChange" | "handleOthersCountChange" | "handleClearItemAssignment">;
};

const defaultAssignment = emptySoftAssignment();

export function GearPickItemResults({ gearPickItems, emptyItemsState, session }: GearPickItemResultsProps) {
  const { t } = useTranslation();
  const { locale: itemLocale } = useItemTooltipLocale();
  const { assignmentsByItemId, rules, handleMySoftsChange, handleOthersCountChange, handleClearItemAssignment } = session;

  return (
    emptyItemsState === "noGear" ? (
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
    )
  );
}
