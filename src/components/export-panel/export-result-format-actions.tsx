import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type ExportResultFormatActionsProps = {
  includeSpecs: boolean;
  includeGearScore: boolean;
  onIncludeSpecsChange: (includeSpecs: boolean) => void;
  onIncludeGearScoreChange: (includeGearScore: boolean) => void;
};

export function ExportResultFormatActions({
  includeSpecs,
  includeGearScore,
  onIncludeSpecsChange,
  onIncludeGearScoreChange,
}: ExportResultFormatActionsProps) {
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: "center", flexWrap: "wrap", justifyContent: "flex-start" }}
    >
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={includeSpecs}
            onChange={(event) => {
              onIncludeSpecsChange(event.target.checked);
            }}
            slotProps={{
              input: {
                "aria-label": t("exportPanel.includeSpecsAria"),
              },
            }}
          />
        }
        label={
          <Typography variant="caption" component="span" sx={{ lineHeight: 1.2 }}>
            {t("exportPanel.includeSpecs")}
          </Typography>
        }
        sx={{ mr: 0.5, ml: 0 }}
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={includeSpecs && includeGearScore}
            disabled={!includeSpecs}
            onChange={(event) => {
              onIncludeGearScoreChange(event.target.checked);
            }}
            slotProps={{
              input: {
                "aria-label": t("exportPanel.includeGearScoreAria"),
              },
            }}
          />
        }
        label={
          <Typography
            variant="caption"
            component="span"
            sx={{
              lineHeight: 1.2,
              color: includeSpecs ? "inherit" : "text.disabled",
            }}
          >
            {t("exportPanel.includeGearScore")}
          </Typography>
        }
        sx={{ mr: 0, ml: 0 }}
      />
    </Stack>
  );
}
