import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type CharacterFormStepProps = {
  step: number;
  title: string;
  /** Shown muted after the title as `(…)` — e.g. optional. */
  titleMark?: string;
  children: ReactNode;
};

/** Numbered section chrome for the add-character workflow. */
export function CharacterFormStep({
  step,
  title,
  titleMark,
  children,
}: CharacterFormStepProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 1.25,
        minWidth: 0,
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1 }}
      >
        <Box
          component="span"
          sx={{ color: "text.secondary", fontWeight: 700, mr: 0.5 }}
        >
          {step}.
        </Box>
        {title}
        {titleMark ? (
          <Box
            component="span"
            sx={{ color: "text.secondary", fontWeight: 500, ml: 0.5 }}
          >
            ({titleMark})
          </Box>
        ) : null}
      </Typography>
      <Stack spacing={1.25}>{children}</Stack>
    </Box>
  );
}
