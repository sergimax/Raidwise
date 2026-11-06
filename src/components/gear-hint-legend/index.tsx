import { Alert, Box, Typography } from "@mui/material";
import type { GearHintCellDisplay, GearUpgradeHint, GearUpgradeHintLevel } from "../../utils/gear-upgrade-hint.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { gearUpgradeHintBandsCellSx, getGearHintKindColor } from "../../utils/gear-hint-display.ts";
import { RaidToggleContent } from "../raid-tracker-table/raid-toggle-content.tsx";

type GearHintLegendProps = {
  onDismiss: () => void;
};

function GearHintKindLegendItem({
  hintKind,
  labelKey,
  meaningKey,
}: {
  hintKind: GearHintCellDisplay["kind"];
  labelKey: "gearHint.kindLabelBis" | "gearHint.kindLabelUpgrades";
  meaningKey: "gearHint.legendBisMeaning" | "gearHint.legendUpgradesMeaning";
}) {
  const { t } = useTranslation();

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        flexWrap: "wrap",
        lineHeight: 1.5,
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={(theme) => ({
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: getGearHintKindColor(hintKind, theme),
        })}
      />
      <Typography component="span" variant="caption" sx={{ fontWeight: 700, lineHeight: 1.5 }}>
        {t(labelKey)}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        color="text.secondary"
        sx={{ lineHeight: 1.5 }}
      >
        = {t(meaningKey)}
      </Typography>
    </Box>
  );
}

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

export function GearHintLegend({ onDismiss }: GearHintLegendProps) {
  const { t } = useTranslation();

  return (
    <Alert
      variant="outlined"
      severity="info"
      icon={false}
      onClose={onDismiss}
      slotProps={{
        closeButton: {
          "aria-label": t("gearHint.legendDismissAria"),
        },
      }}
      sx={{
        alignItems: "center",
        py: 0.75,
        "& .MuiAlert-message": {
          display: "flex",
          alignItems: "center",
          py: 0,
          width: "100%",
        },
        "& .MuiAlert-action": {
          alignItems: "center",
          pt: 0,
          pb: 0,
          mr: -0.5,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.25 }}>
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
            EXAMPLE_BANDS_SX,
          ]}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <RaidToggleContent checked={false} main={{ bis: 2, ilvl: 4 }} off={{ bis: 1, ilvl: 3 }} />
          </Box>
        </Box>
        <Box sx={{ flex: "1 1 240px", minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.75,
              rowGap: 0.25,
            }}
          >
            <GearHintKindLegendItem
              hintKind="bis"
              labelKey="gearHint.kindLabelBis"
              meaningKey="gearHint.legendBisMeaning"
            />
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              aria-hidden
              sx={{ lineHeight: 1.5 }}
            >
              ·
            </Typography>
            <GearHintKindLegendItem
              hintKind="ilvl"
              labelKey="gearHint.kindLabelUpgrades"
              meaningKey="gearHint.legendUpgradesMeaning"
            />
          </Box>
          <Typography component="p" variant="caption" color="text.secondary">
            {t("gearHint.legendCellLayout")}
          </Typography>
        </Box>
      </Box>
    </Alert>
  );
}
