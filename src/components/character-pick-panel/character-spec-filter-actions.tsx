import DeselectIcon from "@mui/icons-material/Deselect";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type CharacterPickSpecFilterActionsProps = {
  disabled?: boolean;
  onSelectAll: () => void;
  onClearAll: () => void;
};

export function CharacterPickSpecFilterActions({
  disabled = false,
  onSelectAll,
  onClearAll,
}: CharacterPickSpecFilterActionsProps) {
  const { t } = useTranslation();

  return (
    <>
      <Tooltip title={t("characterPickPanel.selectAllSpecs")}>
        <span>
          <IconButton
            size="small"
            color="inherit"
            disabled={disabled}
            aria-label={t("characterPickPanel.selectAllSpecsAria")}
            onClick={onSelectAll}
          >
            <SelectAllIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("characterPickPanel.clearAllSpecs")}>
        <span>
          <IconButton
            size="small"
            color="inherit"
            disabled={disabled}
            aria-label={t("characterPickPanel.clearAllSpecsAria")}
            onClick={onClearAll}
          >
            <DeselectIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
}
