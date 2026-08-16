import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

type ExportFilterSectionProps = {
  /** Optional workflow step number shown before the title (Character pick). */
  step?: number;
  title: string;
  /** When set, shown muted after the title as `(…)` — e.g. optional filters. */
  titleMark?: string;
  /** Icon / button actions in the title row (reset, select all, copy, …). */
  titleActions?: ReactNode;
  /** Optional line under the title row (e.g. active BiS list name). */
  subtitle?: string;
  description?: string;
  /**
   * Format / filter toggles under the description (e.g. With upgrades,
   * Include specs / GS, Name / Details). Prefer this over titleActions for switches.
   */
  descriptionActions?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
};

const stepBadgeSx = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 22,
  height: 22,
  px: 0.5,
  mr: 0.75,
  borderRadius: "8px",
  bgcolor: "var(--brand-soft)",
  color: "var(--brand)",
  border: "1px solid color-mix(in srgb, var(--brand) 40%, transparent)",
  fontWeight: 700,
  fontSize: "0.75rem",
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
  flexShrink: 0,
  verticalAlign: "middle",
} as const;

export function ExportFilterSection({
  step,
  title,
  titleMark,
  titleActions,
  subtitle,
  description,
  descriptionActions,
  children,
  sx,
  contentSx,
}: ExportFilterSectionProps) {
  const hasDescriptionBlock = Boolean(description || descriptionActions);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderLeft: "3px solid var(--brand)",
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
        bgcolor: "background.paper",
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
        <Typography
          variant="body2"
          sx={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            lineHeight: 1.3,
            minWidth: 0,
            color: "var(--brand)",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0,
          }}
        >
          {step != null ? (
            <Box component="span" sx={stepBadgeSx} aria-hidden>
              {step}
            </Box>
          ) : null}
          <Box component="span" sx={{ minWidth: 0 }}>
            {title}
            {titleMark ? (
              <Box
                component="span"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  fontFamily: "var(--font-body, inherit)",
                  whiteSpace: "pre",
                }}
              >
                {` (${titleMark})`}
              </Box>
            ) : null}
          </Box>
        </Typography>
        {titleActions ? (
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, gap: 0.25 }}>
            {titleActions}
          </Box>
        ) : null}
      </Stack>
      {subtitle ? (
        <Typography
          variant="body2"
          sx={{
            display: "block",
            mt: 0.35,
            fontWeight: 600,
            lineHeight: 1.35,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
      {description ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: subtitle ? 0.15 : 0.25,
            mb: descriptionActions ? 0.35 : 0.75,
            lineHeight: 1.35,
            flexShrink: 0,
          }}
        >
          {description}
        </Typography>
      ) : null}
      {descriptionActions ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
            mt: description || subtitle ? 0 : 0.25,
            mb: 0.75,
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          {descriptionActions}
        </Box>
      ) : null}
      {!hasDescriptionBlock ? (
        <Box sx={{ mb: 0.75, flexShrink: 0 }} />
      ) : null}
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
