import { Alert, TextField } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

export function ClipboardFallback({ text }: { text: string }) {
  const { t } = useTranslation();
  return (
    <Alert severity="warning" sx={{ mt: 1 }}>
      {t("clipboard.failed")}
      <TextField
        fullWidth
        multiline
        maxRows={5}
        size="small"
        value={text}
        label={t("clipboard.textLabel")}
        slotProps={{ input: { readOnly: true } }}
        onFocus={(event) => event.target.select()}
        sx={{ mt: 1 }}
      />
    </Alert>
  );
}
