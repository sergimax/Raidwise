import SaveIcon from "@mui/icons-material/Save";
import { Button, Stack, TextField } from "@mui/material";
import { useTranslation, type MessageKey } from "../../i18n/use-translation.ts";
import type { BisPresetNameError } from "../../utils/bis-lists.ts";

const nameErrors: Record<BisPresetNameError, MessageKey> = {
  "name-required": "validation.bisListNameRequired",
  "name-reserved": "validation.bisListNameBuiltin",
};

export function BisListSaveForm({ name, nameError, disabled, onNameChange, onSave }: {
  name: string;
  nameError?: BisPresetNameError;
  disabled: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Stack spacing={1}>
      <TextField
        size="small"
        label={t("bisPanel.listName")}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder={t("bisPanel.listNamePlaceholder")}
        error={Boolean(nameError)}
        helperText={nameError ? t(nameErrors[nameError]) : undefined}
        fullWidth
      />
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={onSave}
        disabled={disabled}
        fullWidth
      >
        {t("bisPanel.saveList")}
      </Button>
    </Stack>
  );
}
