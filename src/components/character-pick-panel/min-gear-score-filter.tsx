import {
  Box,
  Checkbox,
  FormControlLabel,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  EXPORT_MIN_GS_COMPACT_MAX,
  EXPORT_MIN_GS_COMPACT_MIN,
  EXPORT_MIN_GS_COMPACT_STEP,
  formatCompactExportMinGearScore,
} from "../../utils/parse-export-min-gear-score.ts";

type CharacterPickMinGearScoreFilterProps = {
  enabled: boolean;
  compactValue: number;
  onEnabledChange: (enabled: boolean) => void;
  onCompactValueChange: (compactValue: number) => void;
};

export function CharacterPickMinGearScoreFilter({
  enabled,
  compactValue,
  onEnabledChange,
  onCompactValueChange,
}: CharacterPickMinGearScoreFilterProps) {
  const { t } = useTranslation();
  const compactLabel = formatCompactExportMinGearScore(compactValue);

  return (
    <Stack spacing={0.75} sx={{ minWidth: 0, width: "100%" }}>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={enabled}
            onChange={(event) => {
              onEnabledChange(event.target.checked);
            }}
            slotProps={{
              input: {
                "aria-label": t("characterPickPanel.minGearScoreEnableAria"),
              },
            }}
          />
        }
        label={
          <Typography variant="body2" component="span" sx={{ lineHeight: 1.3 }}>
            {t("characterPickPanel.minGearScoreEnable")}
          </Typography>
        }
        sx={{
          mr: 0,
          alignSelf: "flex-start",
          maxWidth: "100%",
          "& .MuiFormControlLabel-label": { minWidth: 0 },
        }}
      />
      <Stack spacing={0.5} sx={{ minWidth: 0, width: "100%" }}>
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            // Inset track so thumb at min/max stays inside the column (no overflow-x clip).
            px: 1.25,
            pt: 0.25,
            pb: 0.25,
          }}
        >
          <Slider
            disabled={!enabled}
            min={EXPORT_MIN_GS_COMPACT_MIN}
            max={EXPORT_MIN_GS_COMPACT_MAX}
            step={EXPORT_MIN_GS_COMPACT_STEP}
            value={compactValue}
            onChange={(_event, nextValue) => {
              onCompactValueChange(nextValue as number);
            }}
            valueLabelDisplay="off"
            getAriaValueText={(value) =>
              t("characterPickPanel.minGearScoreSliderValue", {
                value: formatCompactExportMinGearScore(value),
              })
            }
            slotProps={{
              input: {
                "aria-label": t("characterPickPanel.minGearScoreAria"),
              },
            }}
            sx={{
              width: "100%",
              boxSizing: "border-box",
              py: 1.625,
            }}
          />
        </Box>
        <Typography
          component="p"
          color={enabled ? "text.primary" : "text.disabled"}
          sx={{
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
            fontSize: "1.35rem",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            px: 0.25,
          }}
        >
          {enabled
            ? t("characterPickPanel.minGearScoreSliderValue", { value: compactLabel })
            : "—"}
        </Typography>
      </Stack>
    </Stack>
  );
}
