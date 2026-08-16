import { Button } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type ResetParametersActionsProps = {
  onResetParameters: () => void;
};

export function ResetParametersActions({
  onResetParameters,
}: ResetParametersActionsProps) {
  const { t } = useTranslation();

  return (
    <Button
      size="small"
      variant="text"
      onClick={onResetParameters}
      sx={{ whiteSpace: "nowrap", minWidth: 0, px: 1 }}
    >
      {t("characterPickPanel.resetParameters")}
    </Button>
  );
}
