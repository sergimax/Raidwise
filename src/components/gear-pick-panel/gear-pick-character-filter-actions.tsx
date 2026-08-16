import { FormControlLabel, Switch, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type GearPickCharacterFilterActionsProps = {
  onlyWithUpgrades: boolean;
  onOnlyWithUpgradesChange: (onlyWithUpgrades: boolean) => void;
};

export function GearPickCharacterFilterActions({
  onlyWithUpgrades,
  onOnlyWithUpgradesChange,
}: GearPickCharacterFilterActionsProps) {
  const { t } = useTranslation();

  return (
    <FormControlLabel
      control={
        <Switch
          size="small"
          checked={onlyWithUpgrades}
          onChange={(event) => {
            onOnlyWithUpgradesChange(event.target.checked);
          }}
          slotProps={{
            input: {
              "aria-label": t("gearPickPanel.onlyCharactersWithUpgradesAria"),
            },
          }}
        />
      }
      label={
        <Typography variant="caption" component="span" sx={{ lineHeight: 1.2 }}>
          {t("gearPickPanel.onlyCharactersWithUpgrades")}
        </Typography>
      }
      sx={{ mr: 0, ml: 0 }}
    />
  );
}
