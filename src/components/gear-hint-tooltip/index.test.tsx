import { describe, expect, it } from "vitest";
import { createAppTheme } from "../../theme/create-app-theme.ts";
import { testTranslator } from "../../test/i18n.ts";
import { renderWithTheme, screen } from "../../test/render-with-theme.tsx";
import type { SpecGearHint } from "../../utils/character-gear-hints.ts";
import { getGearHintKindColor } from "../../utils/gear-hint-display.ts";
import { GearHintTooltipContent } from "./index.tsx";

const emptyTrack = {
  level: 0 as const,
  upgradeSlotCount: 0,
  upgradeSlots: [],
};

function createSpecHint(
  overrides: Partial<Pick<SpecGearHint, "bisBossLootGroups" | "bisVariantBossLootGroups" | "ilvlBossLootGroups">>,
): SpecGearHint {
  return {
    specGear: { spec: "Fury" },
    gearHint: {
      bis: { ...emptyTrack, level: 1, upgradeSlotCount: 1 },
      bisVariant: emptyTrack,
      ilvl: { ...emptyTrack, level: 2, upgradeSlotCount: 1 },
      equippedCount: 1,
      peakDungeonItemLevel: 271,
      slotAware: true,
      bisListActive: true,
    },
    tierSetHint: { tokenNeeds: [] },
    bisBossLootGroups: [],
    bisVariantBossLootGroups: [],
    ilvlBossLootGroups: [],
    ...overrides,
  };
}

describe("GearHintTooltipContent", () => {
  it("shows coral BiS and teal Upgrades labels on boss loot section headers", () => {
    const theme = createAppTheme("light");
    const { container } = renderWithTheme(
      <GearHintTooltipContent
        gearHints={{
          main: createSpecHint({
            bisBossLootGroups: [{ bossName: "Lord Marrowgar", itemIds: [50606] }],
            ilvlBossLootGroups: [{ bossName: "Deathbringer", itemIds: [50615] }],
          }),
        }}
        locale="en"
        t={testTranslator}
      />,
    );

    expect(screen.getByText("BiS")).toBeInTheDocument();
    expect(screen.getByText("Upgrades")).toBeInTheDocument();
    expect(screen.getByText("BiS loot in this raid (1)")).toBeInTheDocument();
    expect(screen.getByText("Other possible upgrades in this raid (1)")).toBeInTheDocument();

    const dots = container.querySelectorAll('[aria-hidden="true"]');
    const coloredDots = [...dots].filter((element) => {
      const styles = window.getComputedStyle(element);
      return styles.borderRadius === "50%" && styles.width === "8px";
    });

    expect(coloredDots).toHaveLength(2);
    expect(coloredDots[0]).toHaveStyle({
      backgroundColor: getGearHintKindColor("bis", theme),
    });
    expect(coloredDots[1]).toHaveStyle({
      backgroundColor: getGearHintKindColor("ilvl", theme),
    });
  });
  it("counts unique items separately in each loot category", () => {
    renderWithTheme(
      <GearHintTooltipContent
        gearHints={{
          main: createSpecHint({
            bisBossLootGroups: [
              { bossName: "Boss A", itemIds: [50606, 50615] },
              { bossName: "Boss B", itemIds: [50606] },
            ],
            bisVariantBossLootGroups: [{ bossName: "Boss A", itemIds: [49950] }],
            ilvlBossLootGroups: [
              { bossName: "Boss A", itemIds: [50616, 50617, 50618] },
            ],
          }),
        }}
        locale="en"
        t={testTranslator}
      />,
    );

    expect(screen.getByText("BiS loot in this raid (2)")).toBeInTheDocument();
    expect(screen.getByText("BiS normal variants in this raid (1)")).toBeInTheDocument();
    expect(screen.getByText("Other possible upgrades in this raid (3)")).toBeInTheDocument();
  });

});
