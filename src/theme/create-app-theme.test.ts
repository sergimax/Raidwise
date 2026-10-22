import { getContrastRatio, type Theme } from "@mui/material/styles";
import { describe, expect, it } from "vitest";
import { createAppTheme, fontFamilyDisplay } from "./create-app-theme.ts";
import { getTooltipSurface } from "./tooltip-surface.ts";

const modes = [
  [
    "light",
    {
      background: "#fcfbf9",
      paper: "#ffffff",
      text: "#141414",
      muted: "#555555",
      primary: "#0a0a0a",
      primaryText: "#ffffff",
    },
  ],
  [
    "dark",
    {
      background: "#1a1a1a",
      paper: "#242424",
      text: "#f2f2f2",
      muted: "#a3a3a3",
      primary: "#fafafa",
      primaryText: "#111111",
    },
  ],
] as const;

function resolveOverride(override: unknown, theme: Theme): unknown {
  return typeof override === "function" ? override({ theme, ownerState: {} }) : override;
}

describe.each(modes)("createAppTheme(%s)", (mode, expected) => {
  const theme = createAppTheme(mode);

  it("keeps the key palette pairs readable", () => {
    expect(theme.palette.mode).toBe(mode);
    expect(theme.palette.background.default).toBe(expected.background);
    expect(theme.palette.background.paper).toBe(expected.paper);
    expect(theme.palette.text.primary).toBe(expected.text);
    expect(theme.palette.text.secondary).toBe(expected.muted);
    expect(theme.palette.primary.main).toBe(expected.primary);
    expect(theme.palette.primary.contrastText).toBe(expected.primaryText);

    expect(getContrastRatio(theme.palette.text.primary, theme.palette.background.default))
      .toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(theme.palette.text.secondary, theme.palette.background.paper))
      .toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(theme.palette.primary.contrastText, theme.palette.primary.main))
      .toBeGreaterThanOrEqual(4.5);
  });

  it("uses the shared typography and shape scale", () => {
    expect(theme.typography.fontFamily).toContain("'Noto Sans'");
    expect(theme.typography.h6.fontFamily).toBe(fontFamilyDisplay);
    expect(theme.typography.subtitle1.fontFamily).toBe(fontFamilyDisplay);
    expect(theme.typography.button).toMatchObject({
      textTransform: "none",
      fontWeight: 600,
    });
    expect(theme.shape.borderRadius).toBe(6);
  });

  it("keeps dialog and tooltip surfaces consistent", () => {
    const dialogPaper = resolveOverride(
      theme.components?.MuiDialog?.styleOverrides?.paper,
      theme,
    );
    expect(dialogPaper).toMatchObject({ borderRadius: 8, border: "none" });

    const tooltip = resolveOverride(
      theme.components?.MuiTooltip?.styleOverrides?.tooltip,
      theme,
    );
    const surface = getTooltipSurface(mode);
    expect(getContrastRatio(surface.color, surface.bgcolor))
      .toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(surface.mutedColor, surface.bgcolor))
      .toBeGreaterThanOrEqual(4.5);
    expect(tooltip).toMatchObject({
      bgcolor: surface.bgcolor,
      color: surface.color,
      border: `1px solid ${surface.borderColor}`,
      boxShadow: theme.shadows[mode === "light" ? 8 : 12],
      borderRadius: 4,
    });
  });
});
