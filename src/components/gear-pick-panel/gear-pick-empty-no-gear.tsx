import EditIcon from "@mui/icons-material/Edit";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { TranslateFn } from "../../i18n/translate.ts";

type GearPickEmptyNoGearProps = {
  t: TranslateFn;
};

/** Empty soft-targets hint with a visual edit-pen chip (character column header). */
export function GearPickEmptyNoGear({ t }: GearPickEmptyNoGearProps) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
      {t("gearPickPanel.itemsEmptyNoGearPrefix")}{" "}
      <Box
        component="span"
        sx={(theme) => ({
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          verticalAlign: "text-bottom",
          width: 22,
          height: 22,
          mx: 0.25,
          borderRadius: "6px",
          border: 1,
          borderColor: "divider",
          bgcolor: alpha(
            theme.palette.background.paper,
            theme.palette.mode === "light" ? 0.9 : 0.55,
          ),
          color: "text.primary",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 1px 1px rgba(15, 23, 42, 0.04)"
              : "0 1px 1px rgba(0, 0, 0, 0.25)",
        })}
        aria-label={t("intro.featureEditCharacter")}
      >
        <EditIcon sx={{ fontSize: 14 }} />
      </Box>{" "}
      {t("gearPickPanel.itemsEmptyNoGearSuffix")}
    </Typography>
  );
}
