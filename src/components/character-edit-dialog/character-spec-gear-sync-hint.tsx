import { Alert } from "@mui/material";
import type { TranslateFn } from "../../i18n/translate.ts";
import type { SpecGearSyncHints } from "../../utils/character-spec-gear-sync-hints.ts";

type CharacterSpecGearSyncHintProps = {
  hints: SpecGearSyncHints;
  t: TranslateFn;
};

export function CharacterSpecGearSyncHint({
  hints,
  t,
}: CharacterSpecGearSyncHintProps) {
  if (hints.suggestImportGear) {
    return (
      <Alert severity="info" sx={{ py: 0, px: 1, "& .MuiAlert-message": { py: 0.5 } }}>
        {t("characterEdit.suggestImportGear")}
      </Alert>
    );
  }

  if (hints.suggestUpdateGearScore) {
    return (
      <Alert severity="info" sx={{ py: 0, px: 1, "& .MuiAlert-message": { py: 0.5 } }}>
        {t("characterEdit.suggestUpdateGearScore")}
      </Alert>
    );
  }

  return null;
}
