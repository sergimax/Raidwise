import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type DungeonFilterActionsProps = {
  disabled?: boolean;
  onReset: () => void;
};

export function DungeonFilterActions({
  disabled = false,
  onReset,
}: DungeonFilterActionsProps) {
  const { t } = useTranslation();

  return (
    <Tooltip title={t("characterPickPanel.resetDungeonFilter")}>
      <span>
        <IconButton
          size="small"
          color="inherit"
          disabled={disabled}
          aria-label={t("characterPickPanel.resetDungeonFilterAria")}
          onClick={onReset}
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
}
