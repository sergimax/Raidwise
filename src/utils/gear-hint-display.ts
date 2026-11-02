import type { SystemStyleObject } from "@mui/system";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type { GearHintCellDisplay, GearUpgradeHintLevel, GearUpgradeHint } from "./gear-upgrade-hint.ts";

type HintAlphaScale = Record<GearUpgradeHintLevel, number>;

/** BiS (teal) cell tint opacity by hint level — slightly stronger in dark mode. */
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

/** Ilvl (lilac) cell tint opacity by hint level — slightly stronger in dark mode. */
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

  return alpha(getGearHintKindColor(display.kind, theme), opacity);
}

/** Solid BiS (teal) or ilvl (lilac) accent — tooltip dots, legends. */
export function getGearHintKindColor(
  kind: GearHintCellDisplay["kind"],
  theme: Theme,
): string {
  const dark = theme.palette.mode === "dark";
  return kind === "bis"
    ? (dark ? "#2dd4bf" : "#0d9488")
    : (dark ? "#c4b5fd" : "#8b5cf6");
}

/** Toggle cell tint (teal BiS or lilac ilvl by hint level). */
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

/** Independent spec/category bands fade out from the cell center. */
export function gearUpgradeHintBandsCellSx(
  main: GearUpgradeHint | undefined,
  off: GearUpgradeHint | undefined,
  dungeonItemLevels: readonly number[],
  dualSpec: boolean,
): SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>) {
  if (dungeonItemLevels.length === 0 || (!main && !off)) return {};

  return (theme) => {
    const layers: string[] = [];
    for (const [hint, side] of [[main, "left"], [off, "right"]] as const) {
      if (!hint) continue;
      const tracks = [
        { kind: "bis" as const, level: hint.bisListActive ? Math.max(hint.bis.level, hint.bisVariant.level) as GearUpgradeHintLevel : 0 as const },
        { kind: "ilvl" as const, level: hint.ilvl.level },
      ];
      for (const display of tracks) {
        const tint = hintDisplayBackgroundColor(display, dungeonItemLevels, theme);
        if (!tint) continue;
        const color = getGearHintKindColor(display.kind, theme);
        const strength = theme.palette.mode === "dark"
          ? [0, 0.2, 0.28, 0.36]
          : [0, 0.16, 0.23, 0.3];
        const centerColor = alpha(color, strength[display.level]);
        const originX = dualSpec ? (side === "left" ? "right" : "left") : "center";
        const band = display.kind === "bis" ? "top" : "bottom";
        const originY = band === "top" ? "bottom" : "top";
        layers.push(`radial-gradient(ellipse at ${originX} ${originY}, ${centerColor} 0%, ${tint} 45%, ${alpha(color, 0)} 100%) ${side} ${band} / ${dualSpec ? "50%" : "100%"} 50% no-repeat`);
      }
    }
    return gearHintOverlaySx(layers.length > 0 ? layers.join(", ") : undefined);
  };
}
