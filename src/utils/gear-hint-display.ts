import type { SystemStyleObject } from "@mui/system";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type { GearHintCellDisplay, GearUpgradeHintLevel } from "./gear-upgrade-hint.ts";

type HintAlphaScale = Record<GearUpgradeHintLevel, number>;

/** BiS (amber) cell tint opacity by hint level — slightly stronger in dark mode. */
const BIS_HINT_ALPHAS_LIGHT: HintAlphaScale = {
  0: 0,
  1: 0.08,
  2: 0.13,
  3: 0.19,
};

const BIS_HINT_ALPHAS_DARK: HintAlphaScale = {
  0: 0,
  1: 0.1,
  2: 0.16,
  3: 0.23,
};

/** Ilvl (blue) cell tint opacity by hint level — slightly stronger in dark mode. */
const ILVL_HINT_ALPHAS_LIGHT: HintAlphaScale = {
  0: 0,
  1: 0.06,
  2: 0.11,
  3: 0.17,
};

const ILVL_HINT_ALPHAS_DARK: HintAlphaScale = {
  0: 0,
  1: 0.08,
  2: 0.14,
  3: 0.21,
};

function hintAlphasForMode(
  mode: "light" | "dark",
  kind: GearHintCellDisplay["kind"],
): HintAlphaScale {
  if (kind === "bis") {
    return mode === "dark" ? BIS_HINT_ALPHAS_DARK : BIS_HINT_ALPHAS_LIGHT;
  }
  return mode === "dark" ? ILVL_HINT_ALPHAS_DARK : ILVL_HINT_ALPHAS_LIGHT;
}

function hintDisplayBackgroundColor(
  display: GearHintCellDisplay,
  dungeonItemLevels: readonly number[],
  theme: Theme,
): string | undefined {
  if (display.level === 0 || dungeonItemLevels.length === 0) {
    return undefined;
  }

  const alphas = hintAlphasForMode(theme.palette.mode, display.kind);
  const opacity = alphas[display.level];

  if (display.kind === "bis") {
    return alpha(theme.palette.warning.main, opacity);
  }

  const infoMain = theme.palette.info?.main ?? theme.palette.primary.main;
  return alpha(infoMain, opacity);
}

/** Solid BiS (amber) or ilvl (blue) accent — tooltip dots, legends. */
export function getGearHintKindColor(
  kind: GearHintCellDisplay["kind"],
  theme: Theme,
): string {
  if (kind === "bis") {
    return theme.palette.warning.main;
  }

  return theme.palette.info?.main ?? theme.palette.primary.main;
}

/** Toggle cell tint (amber BiS or blue ilvl by hint level). */
export function getGearHintCellBackgroundColor(
  display: GearHintCellDisplay,
  theme: Theme,
): string | undefined {
  return hintDisplayBackgroundColor(display, [1], theme);
}

const GEAR_HINT_CELL_OVERLAY_SX = {
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: "0 1px",
    pointerEvents: "none",
    zIndex: 0,
  },
} as const;

/** Edge accents keep hint strength readable without obscuring raid artwork. */
function hintEdgeShadow(
  display: GearHintCellDisplay | null,
  theme: Theme,
  side: "left" | "right",
): string | undefined {
  if (!display || display.level === 0) return undefined;
  const opacity = [0, 0.35, 0.55, 0.75][display.level];
  const color = alpha(getGearHintKindColor(display.kind, theme), opacity);
  return `inset ${side === "left" ? 4 : -4}px 0 0 ${color}`;
}

function gearHintOverlaySx(
  overlayBackground: string | undefined,
  edgeShadows: (string | undefined)[] = [],
): SystemStyleObject<Theme> {
  if (!overlayBackground) {
    return {};
  }

  return {
    ...GEAR_HINT_CELL_OVERLAY_SX,
    "&::after": {
      ...GEAR_HINT_CELL_OVERLAY_SX["&::after"],
      background: overlayBackground,
      boxShadow: edgeShadows.filter(Boolean).join(", ") || undefined,
    },
  };
}

export function gearUpgradeHintCellSx(
  display: GearHintCellDisplay | null,
  dungeonItemLevels: readonly number[],
  side: "left" | "right" = "left",
): SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>) {
  if (!display || display.level === 0 || dungeonItemLevels.length === 0) {
    return {};
  }

  return (theme) =>
    gearHintOverlaySx(
      hintDisplayBackgroundColor(display, dungeonItemLevels, theme),
      [hintEdgeShadow(display, theme, side)],
    );
}

/** Split cell tint for main (left) and off (right) spec hints; empty halves stay untinted. */
export function gearUpgradeHintDualCellSx(
  mainDisplay: GearHintCellDisplay | null,
  offDisplay: GearHintCellDisplay | null,
  dungeonItemLevels: readonly number[],
): SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>) {
  if (dungeonItemLevels.length === 0) {
    return {};
  }
  if (!mainDisplay && !offDisplay) {
    return {};
  }

  return (theme) => {
    const mainColor = mainDisplay
      ? hintDisplayBackgroundColor(mainDisplay, dungeonItemLevels, theme)
      : undefined;
    const offColor = offDisplay
      ? hintDisplayBackgroundColor(offDisplay, dungeonItemLevels, theme)
      : undefined;

    const edges = [
      hintEdgeShadow(mainDisplay, theme, "left"),
      hintEdgeShadow(offDisplay, theme, "right"),
    ];

    if (mainColor && offColor) {
      return gearHintOverlaySx(
        `linear-gradient(to right, ${mainColor} 50%, ${offColor} 50%)`,
        edges,
      );
    }
    if (mainColor) {
      return gearHintOverlaySx(
        `linear-gradient(to right, ${mainColor} 50%, transparent 50%)`,
        edges,
      );
    }
    if (offColor) {
      return gearHintOverlaySx(
        `linear-gradient(to right, transparent 50%, ${offColor} 50%)`,
        edges,
      );
    }
    return {};
  };
}
