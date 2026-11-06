import { Box } from "@mui/material";
import { gearUpgradeHintBandsCellSx } from "../../utils/gear-hint-display.ts";
import type { GearUpgradeHint, GearUpgradeHintLevel } from "../../utils/gear-upgrade-hint.ts";
import { RaidToggleContent } from "./raid-toggle-content.tsx";

function exampleHint(bis: GearUpgradeHintLevel, ilvl: GearUpgradeHintLevel): GearUpgradeHint {
  return {
    bis: { level: bis, upgradeSlotCount: bis, upgradeSlots: [] },
    bisVariant: { level: 0, upgradeSlotCount: 0, upgradeSlots: [] },
    ilvl: { level: ilvl, upgradeSlotCount: ilvl, upgradeSlots: [] },
    equippedCount: 0,
    peakDungeonItemLevel: 284,
    slotAware: true,
    bisListActive: true,
  };
}

const EXAMPLE_BANDS_SX = gearUpgradeHintBandsCellSx(
  exampleHint(2, 3),
  exampleHint(1, 2),
  [284],
  true,
);

export function GearHintCellExample({ checked = false }: { checked?: boolean }) {
  return (
    <Box
      inert
      aria-hidden
      sx={[
        {
          width: 130,
          flexShrink: 0,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 0.5,
          color: "text.primary",
        },
        !checked && EXAMPLE_BANDS_SX,
      ]}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <RaidToggleContent checked={checked} main={{ bis: 2, ilvl: 4 }} off={{ bis: 1, ilvl: 3 }} />
      </Box>
    </Box>
  );
}
