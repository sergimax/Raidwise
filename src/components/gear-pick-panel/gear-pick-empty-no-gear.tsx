import { Typography } from "@mui/material";
import type { TranslateFn } from "../../i18n/translate.ts";
import { EditIconMention } from "../edit-icon-mention/index.tsx";

type GearPickEmptyNoGearProps = {
  t: TranslateFn;
};

/** Empty soft-targets hint with a visual edit-pen chip (character column header). */
export function GearPickEmptyNoGear({ t }: GearPickEmptyNoGearProps) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
      {t("gearPickPanel.itemsEmptyNoGearPrefix")}{" "}
      <EditIconMention ariaLabel={t("intro.featureEditCharacter")} />{" "}
      {t("gearPickPanel.itemsEmptyNoGearSuffix")}
    </Typography>
  );
}
