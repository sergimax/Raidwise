import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type GearPickCopyFormatActionsProps = {
  includeCharacterName: boolean;
  includeSpec: boolean;
  includeSoftCount: boolean;
  includeAllItems: boolean;
  compactLines: boolean;
  onIncludeCharacterNameChange: (includeCharacterName: boolean) => void;
  onIncludeSpecChange: (includeSpec: boolean) => void;
  onIncludeSoftCountChange: (includeSoftCount: boolean) => void;
  onIncludeAllItemsChange: (includeAllItems: boolean) => void;
  onCompactLinesChange: (compactLines: boolean) => void;
};

export function GearPickCopyFormatActions({
  includeCharacterName,
  includeSpec,
  includeSoftCount,
  includeAllItems,
  compactLines,
  onIncludeCharacterNameChange,
  onIncludeSpecChange,
  onIncludeSoftCountChange,
  onIncludeAllItemsChange,
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
            checked={includeSpec}
            onChange={(event) => onIncludeSpecChange(event.target.checked)}
            slotProps={{ input: { "aria-label": t("gearPickPanel.copyIncludeSpecAria") } }}
          />
        }
        label={<Typography variant="caption" component="span" sx={{ lineHeight: 1.2 }}>{t("gearPickPanel.copyIncludeSpec")}</Typography>}
        sx={{ mr: 0, ml: 0 }}
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={includeSoftCount}
            onChange={(event) => onIncludeSoftCountChange(event.target.checked)}
            slotProps={{ input: { "aria-label": t("gearPickPanel.copyIncludeSoftCountAria") } }}
          />
        }
        label={<Typography variant="caption" component="span" sx={{ lineHeight: 1.2 }}>{t("gearPickPanel.copyIncludeSoftCount")}</Typography>}
        sx={{ mr: 0, ml: 0 }}
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={includeAllItems}
            onChange={(event) => onIncludeAllItemsChange(event.target.checked)}
            slotProps={{ input: { "aria-label": t("gearPickPanel.copyIncludeAllItemsAria") } }}
          />
        }
        label={<Typography variant="caption" component="span" sx={{ lineHeight: 1.2 }}>{t("gearPickPanel.copyIncludeAllItems")}</Typography>}
        sx={{ mr: 0, ml: 0 }}
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
