import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { TranslateFn } from "../../i18n/translate.ts";
import {
  type SoftRollRules,
  type SoftRollSystem,
} from "../../utils/gear-pick-soft-roll.ts";

type GearPickRulesProps = {
  rules: SoftRollRules;
  onRulesChange: (next: SoftRollRules) => void;
  softBudgetUsed: number;
  t: TranslateFn;
};

export function GearPickRules({
  rules,
  onRulesChange,
  softBudgetUsed,
  t,
}: GearPickRulesProps) {
  const setMaxSofts = (delta: number) => {
    const next = Math.max(1, rules.maxSofts + delta);
    if (next === rules.maxSofts) {
      return;
    }
    onRulesChange({ ...rules, maxSofts: next });
  };

  return (
    <Stack spacing={1} sx={{ height: "100%", justifyContent: "space-between" }}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          {t("gearPickPanel.maxSoftsLabel")}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <IconButton
            size="small"
            aria-label={t("gearPickPanel.maxSoftsAria")}
            disabled={rules.maxSofts <= 1}
            onClick={() => {
              setMaxSofts(-1);
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" component="span" sx={{ minWidth: 28, textAlign: "center" }}>
            {rules.maxSofts}
          </Typography>
          <IconButton
            size="small"
            aria-label={t("gearPickPanel.maxSoftsAria")}
            onClick={() => {
              setMaxSofts(1);
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {t("gearPickPanel.softBudget", {
            used: softBudgetUsed,
            max: rules.maxSofts,
          })}
        </Typography>
      </Box>

      <FormControl sx={{ minWidth: 0 }}>
        <FormLabel id="gear-pick-soft-system-label" sx={{ typography: "caption", mb: 0.25 }}>
          {t("gearPickPanel.systemLabel")}
        </FormLabel>
        <RadioGroup
          row
          aria-labelledby="gear-pick-soft-system-label"
          value={rules.system}
          onChange={(event) => {
            onRulesChange({
              ...rules,
              system: event.target.value as SoftRollSystem,
            });
          }}
          sx={{
            flexWrap: "nowrap",
            columnGap: 0.5,
            "& .MuiFormControlLabel-root": {
              mr: 0.5,
              ml: 0,
            },
          }}
        >
          <FormControlLabel
            value="reroll"
            control={<Radio size="small" />}
            label={t("gearPickPanel.systemReroll")}
            slotProps={{ typography: { variant: "body2", noWrap: true } }}
          />
          <FormControlLabel
            value="plus100"
            control={<Radio size="small" />}
            label={t("gearPickPanel.systemPlus100")}
            slotProps={{ typography: { variant: "body2", noWrap: true } }}
          />
        </RadioGroup>
      </FormControl>
    </Stack>
  );
}
