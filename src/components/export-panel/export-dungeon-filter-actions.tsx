import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type ExportDungeonFilterActionsProps = {
  disabled?: boolean;
  onReset: () => void;
};

export function ExportDungeonFilterActions({
  disabled = false,
  onReset,
}: ExportDungeonFilterActionsProps) {
  const { t } = useTranslation();

  return (
    <Tooltip title={t("exportPanel.resetDungeonFilter")}>
      <span>
        <IconButton
          size="small"
          color="inherit"
          disabled={disabled}
          aria-label={t("exportPanel.resetDungeonFilterAria")}
          onClick={onReset}
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
}
