import { Alert, Button, Stack } from "@mui/material";
import { useWowDataReady } from "../../hooks/use-wow-data-ready.ts";
import { useTranslation } from "../../i18n/use-translation.ts";

export function WowDataNotice() {
  const { coreStatus, hintStatus, retry } = useWowDataReady();
  const { t } = useTranslation();
  const missing = coreStatus === "missing" || hintStatus === "missing";
  const failed = missing || coreStatus === "failed" || hintStatus === "failed";
  if (!failed) return null;

  return (
    <Alert
      severity="warning"
      action={
        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={retry}>{t("wowData.retry")}</Button>
          <Button color="inherit" onClick={() => window.location.reload()}>{t("wowData.reload")}</Button>
        </Stack>
      }
    >
      {t(missing ? "wowData.missing" : "wowData.failed")}
    </Alert>
  );
}
