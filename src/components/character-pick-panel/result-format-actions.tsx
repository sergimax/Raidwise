import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type CharacterPickResultFormatActionsProps = {
  includeSpecs: boolean;
  includeGearScore: boolean;
  onIncludeSpecsChange: (includeSpecs: boolean) => void;
  onIncludeGearScoreChange: (includeGearScore: boolean) => void;
};

export function CharacterPickResultFormatActions({
  includeSpecs,
  includeGearScore,
  onIncludeSpecsChange,
  onIncludeGearScoreChange,
}: CharacterPickResultFormatActionsProps) {
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
                "aria-label": t("characterPickPanel.includeSpecsAria"),
              },
            }}
          />
        }
        label={
          <Typography variant="caption" component="span" sx={{ lineHeight: 1.2 }}>
            {t("characterPickPanel.includeSpecs")}
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
                "aria-label": t("characterPickPanel.includeGearScoreAria"),
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
            {t("characterPickPanel.includeGearScore")}
          </Typography>
        }
        sx={{ mr: 0, ml: 0 }}
      />
    </Stack>
  );
}
