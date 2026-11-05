import { describe, expect, it } from "vitest";
import { alpha } from "@mui/material/styles";
import { createAppTheme } from "../theme/create-app-theme.ts";
import {
  gearUpgradeHintBandsCellSx,
  gearUpgradeHintCellSx,
  gearUpgradeHintDualCellSx,
  getGearHintCellBackgroundColor,
  getGearHintKindColor,
} from "./gear-hint-display.ts";

const dungeonItemLevels = [271, 284] as const;

function resolveDualCellOverlayBackground(
  mainDisplay: Parameters<typeof gearUpgradeHintDualCellSx>[0],
  offDisplay: Parameters<typeof gearUpgradeHintDualCellSx>[1],
): { background: string | undefined; resolved: Record<string, unknown> } {
  const theme = createAppTheme("light");
  const sx = gearUpgradeHintDualCellSx(
    mainDisplay,
    offDisplay,
    dungeonItemLevels,
  );
  const resolved = (typeof sx === "function" ? sx(theme) : sx) as Record<
    string,
    unknown
  >;

  const overlay = resolved["&::after"];
  if (typeof overlay !== "object" || overlay === null || !("background" in overlay)) {
    return { background: undefined, resolved };
  }

  const background = overlay.background;
  return {
    background: typeof background === "string" ? background : undefined,
    resolved,
  };
}

describe("gearUpgradeHintCellSx", () => {
  it("renders hint tint on a ::after overlay so row hover can show through", () => {
    const theme = createAppTheme("light");
    const sx = gearUpgradeHintCellSx({ kind: "bis", level: 1 }, dungeonItemLevels);
    const resolved = (typeof sx === "function" ? sx(theme) : sx) as Record<
      string,
      unknown
    >;

    expect(resolved.position).toBe("relative");
    expect(resolved.background).toBeUndefined();
    expect(resolved["&::after"]).toMatchObject({
      background: getGearHintCellBackgroundColor({ kind: "bis", level: 1 }, theme),
      pointerEvents: "none",
      inset: "0 1px",
      boxShadow: `inset 4px 0 0 ${alpha(getGearHintKindColor("bis", theme), 0.35)}`,
    });
  });
});

describe("gearUpgradeHintDualCellSx", () => {
  it("tints only the left half when only main has a hint", () => {
    const { background, resolved } = resolveDualCellOverlayBackground(
      { kind: "ilvl", level: 2 },
      null,
    );

    expect(resolved.position).toBe("relative");
    expect(resolved.background).toBeUndefined();
    expect(resolved["&::after"]).toMatchObject({
      boxShadow: `inset 4px 0 0 ${alpha(getGearHintKindColor("ilvl", createAppTheme("light")), 0.55)}`,
    });

    expect(background).toMatch(/^linear-gradient\(to right,/);
    expect(background).toContain("50%, transparent 50%");
    expect(background).not.toContain("transparent 50%, transparent");
  });

  it("tints only the right half when only off has a hint", () => {
    const { background } = resolveDualCellOverlayBackground(
      null,
      { kind: "bis", level: 1 },
    );

    expect(background).toMatch(/^linear-gradient\(to right, transparent 50%,/);
    expect(background).toContain("50%)");
  });

  it("splits tint when both specs have hints", () => {
    const theme = createAppTheme("light");
    const mainColor = getGearHintCellBackgroundColor(
      { kind: "ilvl", level: 2 },
      theme,
    );
    const offColor = getGearHintCellBackgroundColor(
      { kind: "bis", level: 1 },
      theme,
    );
    const { background } = resolveDualCellOverlayBackground(
      { kind: "ilvl", level: 2 },
      { kind: "bis", level: 1 },
    );

    expect(background).toBe(
      `linear-gradient(to right, ${mainColor} 50%, ${offColor} 50%)`,
    );
  });
});

describe("getGearHintCellBackgroundColor", () => {
  it("uses coral and teal colors for BiS and ilvl tints", () => {
    const theme = createAppTheme("light");
    const bisLevel1 = getGearHintCellBackgroundColor(
      { kind: "bis", level: 1 },
      theme,
    );
    const ilvlLevel1 = getGearHintCellBackgroundColor(
      { kind: "ilvl", level: 1 },
      theme,
    );

    expect(bisLevel1).toBe(alpha(getGearHintKindColor("bis", theme), 0.08));
    expect(ilvlLevel1).toBe(alpha(getGearHintKindColor("ilvl", theme), 0.06));
    expect(getGearHintKindColor("bis", theme)).toBe("#e11d48");
  });

  it("uses higher alphas in dark mode than light for the same hint level", () => {
    const lightTheme = createAppTheme("light");
    const darkTheme = createAppTheme("dark");

    for (const display of [
      { kind: "bis" as const, level: 1 as const },
      { kind: "bis" as const, level: 3 as const },
      { kind: "ilvl" as const, level: 1 as const },
      { kind: "ilvl" as const, level: 3 as const },
    ]) {
      const lightColor = getGearHintCellBackgroundColor(display, lightTheme)!;
      const darkColor = getGearHintCellBackgroundColor(display, darkTheme)!;

      expect(lightColor).toMatch(/^rgba\(/);
      expect(darkColor).toMatch(/^rgba\(/);
      expect(lightColor).not.toEqual(darkColor);
      expect(darkColor.split(",")[3]).not.toEqual(lightColor.split(",")[3]);
    }
  });

  it("uses lighter coral in dark mode for zinc backgrounds", () => {
    expect(getGearHintKindColor("bis", createAppTheme("dark"))).toBe("#fb7185");
  });
});

describe("getGearHintKindColor", () => {
  it("returns coral and teal for BiS and ilvl dots", () => {
    const theme = createAppTheme("light");

    expect(getGearHintKindColor("bis", theme)).toBe(
      "#e11d48",
    );
    expect(getGearHintKindColor("ilvl", theme)).toBe(
      "#0d9488",
    );
  });
});

describe("gearUpgradeHintBandsCellSx", () => {
  const emptyTrack = { level: 0 as const, upgradeSlotCount: 0, upgradeSlots: [] };
  const hint = {
    bis: { ...emptyTrack, level: 1 as const },
    bisVariant: emptyTrack,
    ilvl: { ...emptyTrack, level: 2 as const },
    equippedCount: 16,
    peakDungeonItemLevel: 284,
    slotAware: true,
    bisListActive: true,
  };

  it("shows both categories on both spec sides independently", () => {
    const sx = gearUpgradeHintBandsCellSx(hint, hint, dungeonItemLevels, true);
    const resolved = (typeof sx === "function" ? sx(createAppTheme("light")) : sx) as Record<string, unknown>;
    const background = (resolved["&::after"] as { background: string }).background;
    for (const position of ["left top", "left bottom", "right top", "right bottom"]) {
      expect(background).toContain(`${position} / 50% 50% no-repeat`);
    }
    for (const origin of ["right bottom", "right top", "left bottom", "left top"]) {
      expect(background).toContain(`radial-gradient(ellipse at ${origin},`);
    }
    expect(background).toContain("rgba(225, 29, 72, 0) 100%");
    expect(background).toContain("rgba(225, 29, 72, 0.12)");
    expect(background).toContain("rgba(13, 148, 136, 0.165)");
  });

  it("leaves missing categories untinted and uses full width for a single spec", () => {
    const sx = gearUpgradeHintBandsCellSx({ ...hint, bis: emptyTrack }, undefined, dungeonItemLevels, false);
    const resolved = (typeof sx === "function" ? sx(createAppTheme("light")) : sx) as Record<string, unknown>;
    const background = (resolved["&::after"] as { background: string }).background;
    expect(background).toContain("left bottom / 100% 50% no-repeat");
    expect(background).not.toContain("left top /");
    expect(background).toContain("radial-gradient(ellipse at center top,");
    expect(gearUpgradeHintBandsCellSx(hint, hint, [], true)).toEqual({});
  });
});
