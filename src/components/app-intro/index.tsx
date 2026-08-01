import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { AppIntroProps } from "./types.ts";

export function AppIntro({ visible = true }: AppIntroProps) {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        px: { xs: 1.75, sm: 2.25 },
        py: { xs: 1.75, sm: 2.25 },
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)"
            : "0 1px 2px rgba(0, 0, 0, 0.35)",
      })}
    >
      <Stack spacing={0.75}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {t("intro.title")}
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ maxWidth: 52 * 8 }}>
          {t("intro.body")}{" "}
          <Box component="strong" sx={{ color: "text.primary", fontWeight: 700 }}>
            {t("intro.addFromTemplate")}
          </Box>{" "}
          {t("intro.bodySuffix")}
        </Typography>
      </Stack>
    </Box>
  );
}
