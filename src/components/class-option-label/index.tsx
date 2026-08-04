import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";
import { getLocalizedClassName } from "../../i18n/localized-domain.ts";
import { characterNameDisplaySx } from "../../utils/character-display.ts";
import type { ClassOptionLabelProps } from "./types.ts";

export function ClassOptionLabel({
  characterClass,
  iconSize = 20,
  variant = "body2",
}: ClassOptionLabelProps) {
  const { locale } = useTranslation();

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Box
        component="img"
        src={characterClass.icon}
        alt=""
        width={iconSize}
        height={iconSize}
        sx={{ borderRadius: "4px", flexShrink: 0 }}
      />
      <Typography
        component="span"
        variant={variant}
        sx={characterNameDisplaySx(characterClass)}
      >
        {getLocalizedClassName(characterClass.name, locale)}
      </Typography>
    </Stack>
  );
}
