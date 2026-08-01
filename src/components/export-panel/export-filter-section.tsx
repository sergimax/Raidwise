import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

type ExportFilterSectionProps = {
  /** Optional workflow step number shown before the title (Character pick). */
  step?: number;
  title: string;
  /** When set, shown muted after the title as `(…)` — e.g. optional filters. */
  titleMark?: string;
  titleActions?: ReactNode;
  description?: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
};

export function ExportFilterSection({
  step,
  title,
  titleMark,
  titleActions,
  description,
  children,
  sx,
  contentSx,
}: ExportFilterSectionProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 1.25,
        minWidth: 0,
        minHeight: 0,
        maxWidth: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        ...sx,
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3, minWidth: 0 }}>
          {step != null ? (
            <Box
              component="span"
              sx={{ color: "text.secondary", fontWeight: 700, mr: 0.5 }}
            >
              {step}.
            </Box>
          ) : null}
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
        {titleActions ? (
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, gap: 0.25 }}>
            {titleActions}
          </Box>
        ) : null}
      </Stack>
      {description ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 0.25,
            mb: 0.75,
            lineHeight: 1.35,
            flexShrink: 0,
          }}
        >
          {description}
        </Typography>
      ) : (
        <Box sx={{ mb: 0.75, flexShrink: 0 }} />
      )}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowX: "hidden",
          overflowY: "auto",
          ...contentSx,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
