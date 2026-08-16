import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type GearPickCopyFormatActionsProps = {
  includeCharacterName: boolean;
  compactLines: boolean;
  onIncludeCharacterNameChange: (includeCharacterName: boolean) => void;
  onCompactLinesChange: (compactLines: boolean) => void;
};

export function GearPickCopyFormatActions({
  includeCharacterName,
  compactLines,
  onIncludeCharacterNameChange,
  onCompactLinesChange,
}: GearPickCopyFormatActionsProps) {
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
            checked={includeCharacterName}
            onChange={(event) => {
              onIncludeCharacterNameChange(event.target.checked);
            }}
            slotProps={{
              input: {
                "aria-label": t("gearPickPanel.copyIncludeNameAria"),
              },
            }}
          />
        }
        label={
          <Typography variant="caption" component="span" sx={{ lineHeight: 1.2 }}>
            {t("gearPickPanel.copyIncludeName")}
          </Typography>
        }
        sx={{ mr: 0.5, ml: 0 }}
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={!compactLines}
            onChange={(event) => {
              onCompactLinesChange(!event.target.checked);
            }}
            slotProps={{
              input: {
                "aria-label": t("gearPickPanel.copyIncludeDetailsAria"),
              },
            }}
          />
        }
        label={
          <Typography variant="caption" component="span" sx={{ lineHeight: 1.2 }}>
            {t("gearPickPanel.copyIncludeDetails")}
          </Typography>
        }
        sx={{ mr: 0, ml: 0 }}
      />
    </Stack>
  );
}
