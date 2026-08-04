import type { Theme } from "@mui/material/styles";
import { appThemeTokens } from "../theme/create-app-theme.ts";

export type CompletionChipFill = {
  backgroundColor: string;
  color: string;
};

type ProgressStop = CompletionChipFill & { minRatio: number };

/**
 * Theme-aligned progress: muted → danger → brand/warning → info → ok.
 * Light mode uses darker/dimmer palette stops so chips sit quieter on cream.
 */
function progressStops(theme: Theme): readonly ProgressStop[] {
  const { palette } = theme;
  const isLight = palette.mode === "light";

  if (isLight) {
    return [
      {
        minRatio: 0.001,
        backgroundColor: palette.error.dark,
        color: "#ffffff",
      },
      {
        minRatio: 0.15,
        backgroundColor: "#991b1b",
        color: "#ffffff",
      },
      {
        minRatio: 0.3,
        backgroundColor: palette.warning.dark,
        color: "#ffffff",
      },
      {
        minRatio: 0.45,
        backgroundColor: "#a16207",
        color: "#ffffff",
      },
      {
        minRatio: 0.6,
        backgroundColor: palette.secondary.dark,
        color: palette.secondary.contrastText,
      },
      {
        minRatio: 0.75,
        backgroundColor: palette.info.dark,
        color: "#ffffff",
      },
      {
        minRatio: 0.9,
        backgroundColor: "#075985",
        color: "#ffffff",
      },
      {
        minRatio: 1,
        backgroundColor: palette.success.dark,
        color: "#ffffff",
      },
    ];
  }

  return [
    {
      minRatio: 0.001,
      backgroundColor: palette.error.main,
      color: palette.error.contrastText,
    },
    {
      minRatio: 0.15,
      backgroundColor: palette.error.dark,
      color: palette.error.contrastText,
    },
    {
      minRatio: 0.3,
      backgroundColor: palette.warning.dark,
      color: palette.primary.contrastText,
    },
    {
      minRatio: 0.45,
      backgroundColor: palette.warning.main,
      color: appThemeTokens.dark.primaryFg,
    },
    {
      minRatio: 0.6,
      backgroundColor: palette.secondary.main,
      color: palette.secondary.contrastText,
    },
    {
      minRatio: 0.75,
      backgroundColor: palette.info.main,
      color: appThemeTokens.dark.primaryFg,
    },
    {
      minRatio: 0.9,
      backgroundColor: palette.info.dark,
      color: "#ffffff",
    },
    {
      minRatio: 1,
      backgroundColor: palette.success.main,
      color: palette.success.contrastText,
    },
  ];
}

function grayFill(theme: Theme): CompletionChipFill {
  const tokens = appThemeTokens[theme.palette.mode];
  return theme.palette.mode === "dark"
    ? { backgroundColor: "#3f3f3f", color: tokens.text }
    : { backgroundColor: "#737373", color: tokens.primaryFg };
}

function progressFill(theme: Theme, ratio: number): CompletionChipFill {
  const stops = progressStops(theme);
  const clamped = Math.min(Math.max(ratio, 0), 1);
  let fill: CompletionChipFill = {
    backgroundColor: stops[0].backgroundColor,
    color: stops[0].color,
  };

  for (const stop of stops) {
    if (clamped >= stop.minRatio) {
      fill = { backgroundColor: stop.backgroundColor, color: stop.color };
    }
  }

  return fill;
}

/**
 * Progress bar / label colors for `CompletionCountChip`.
 * `backgroundColor` = bar fill + label; `color` kept for callers that need on-fill ink.
 * Scale: muted → danger → brand/warning → info → ok.
 */
export function completionChipFill(
  completed: number,
  total: number,
  theme: Theme,
): CompletionChipFill {
  if (total <= 0 || completed <= 0) {
    return grayFill(theme);
  }

  const ratio = completed / total;
  if (ratio >= 1) {
    const stops = progressStops(theme);
    const complete = stops[stops.length - 1];
    return {
      backgroundColor: complete.backgroundColor,
      color: complete.color,
    };
  }

  return progressFill(theme, ratio);
}
