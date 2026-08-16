import { Button } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type ExportPanelHeaderActionsProps = {
  onResetParameters: () => void;
};

export function ExportPanelHeaderActions({
  onResetParameters,
}: ExportPanelHeaderActionsProps) {
  const { t } = useTranslation();

  return (
    <Button
      size="small"
      variant="text"
      onClick={onResetParameters}
      sx={{ whiteSpace: "nowrap", minWidth: 0, px: 1 }}
    >
      {t("exportPanel.resetParameters")}
    </Button>
  );
}
