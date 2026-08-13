import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type GearPickItemsActionsProps = {
  disabled?: boolean;
  onReset: () => void;
};

export function GearPickItemsActions({
  disabled = false,
  onReset,
}: GearPickItemsActionsProps) {
  const { t } = useTranslation();

  return (
    <Tooltip title={t("gearPickPanel.resetSoftAssignments")}>
      <span>
        <IconButton
          size="small"
          color="inherit"
          disabled={disabled}
          aria-label={t("gearPickPanel.resetSoftAssignmentsAria")}
          onClick={onReset}
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
}
