import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useScrollToTopOnPanelOpen } from "../../hooks/use-scroll-to-top-on-panel-open.ts";

export type TrackerToolbarPanelProps = {
  panelId: string;
  title: string;
  description?: string;
  descriptionTooltip?: string;
  closeAriaLabel: string;
  onClose: () => void;
  /** Optional controls rendered between the title block and the close button. */
  headerActions?: ReactNode;
  /** Caps panel width (narrow forms or wide multi-column panels). */
  maxWidth?: number;
  children: ReactNode;
};

/** Shared shell for header toolbar panels (outlined card, title, optional hint, close icon). */
export function TrackerToolbarPanel({
  panelId,
  title,
  description,
  descriptionTooltip,
  closeAriaLabel,
  onClose,
  headerActions,
  maxWidth,
  children,
}: TrackerToolbarPanelProps) {
  useScrollToTopOnPanelOpen(panelId);

  const descriptionNode = description ? (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        display: "block",
        lineHeight: 1.35,
        cursor: descriptionTooltip ? "help" : undefined,
      }}
    >
      {description}
    </Typography>
  ) : null;

  return (
    <Paper
      variant="outlined"
      data-toolbar-panel={panelId}
      sx={{
        p: { xs: 1.5, sm: 2 },
        width: maxWidth ? "100%" : undefined,
        maxWidth,
        minWidth: 0,
        boxSizing: "border-box",
        // Keep unit-grid children (Character / Soft pick) from painting past the outlined edge.
        overflow: "hidden",
        bgcolor: "background.paper",
        // Gallery F — dot grid; step blocks stay solid fill.
        backgroundImage:
          "radial-gradient(var(--panel-bg-dot) 1px, transparent 1px)",
        backgroundSize: "var(--panel-bg-dot-size) var(--panel-bg-dot-size)",
        backgroundPosition: "0 0",
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {title}
            </Typography>
            {descriptionNode && descriptionTooltip ? (
              <Tooltip title={descriptionTooltip} placement="bottom-start">
                {descriptionNode}
              </Tooltip>
            ) : (
              descriptionNode
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, gap: 0.5 }}>
            {headerActions}
            <IconButton
              size="small"
              aria-label={closeAriaLabel}
              onClick={onClose}
              sx={{ mt: -0.25, mr: -0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}
