import { Alert, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation, type MessageKey } from "../../i18n/use-translation.ts";
import {
  LOAD_WARNING_CORRUPTED_SAVE,
  LOAD_WARNING_UNSUPPORTED_SAVE,
  STORAGE_CONFLICT,
  STORAGE_LOCK_UNAVAILABLE,
  STORAGE_QUOTA_EXCEEDED,
  STORAGE_READ_FAILED,
  STORAGE_WRITE_FAILED,
} from "../../storage/constants.ts";
import type { LoadWarning, SaveError } from "../../storage/local-save.ts";
import { downloadJson } from "../../utils/download-json.ts";
import { DeleteConfirmDialog } from "../raid-tracker-table/delete-confirm-dialog.tsx";

const messages: Record<LoadWarning | SaveError, MessageKey> = {
  [LOAD_WARNING_CORRUPTED_SAVE]: "storage.corrupted",
  [LOAD_WARNING_UNSUPPORTED_SAVE]: "storage.unsupported",
  [STORAGE_CONFLICT]: "storage.conflict",
  [STORAGE_LOCK_UNAVAILABLE]: "storage.lockUnavailable",
  [STORAGE_READ_FAILED]: "storage.readFailed",
  [STORAGE_QUOTA_EXCEEDED]: "storage.quotaExceeded",
  [STORAGE_WRITE_FAILED]: "storage.saveFailed",
};

type StorageProblemProps = {
  storageLoadWarning: LoadWarning | null;
  storageSaveError: SaveError | null;
  storageOriginal: string | null;
  storageSaving: boolean;
  storageHasDraft: boolean;
  storageVolatileDraft: boolean;
  exportStorageDraft: () => string;
  recoverStorage?: () => void;
  retryStorageSave?: () => void;
  discardStorageDraft: () => boolean;
  filename: string;
};

export function StorageProblem({
  storageLoadWarning, storageSaveError, storageOriginal, storageSaving, storageHasDraft,
  storageVolatileDraft, exportStorageDraft, recoverStorage, retryStorageSave, discardStorageDraft, filename,
}: StorageProblemProps) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState<"replace" | "discard" | null>(null);
  if (!storageLoadWarning && !storageSaveError && !storageVolatileDraft) {
    return storageSaving ? <Alert severity="info" role="status">{t("storage.saving")}</Alert> : null;
  }
  const conflict = storageSaveError === STORAGE_CONFLICT;

  return (
    <>
      <Alert severity="error">
        {storageLoadWarning && <Typography variant="body2">{t(messages[storageLoadWarning])}</Typography>}
        {storageSaveError && storageSaveError !== storageLoadWarning && (
          <Typography variant="body2">{t(messages[storageSaveError])}</Typography>
        )}
        {storageVolatileDraft && <Typography variant="body2">{t("storage.volatileDraft")}</Typography>}
        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: "wrap" }}>
          {storageOriginal != null && (
            <Button color="inherit" onClick={() => downloadJson(storageOriginal, `${filename}-original.json`)}>
              {t("storage.downloadOriginal")}
            </Button>
          )}
          <Button color="inherit" onClick={() => downloadJson(exportStorageDraft(), `${filename}-draft.json`)}>
            {t("storage.downloadDraft")}
          </Button>
          {conflict ? (
            <Button color="inherit" onClick={() => {
              if (storageHasDraft) setConfirm("discard");
              else window.location.reload();
            }}>
              {t("storage.loadLatest")}
            </Button>
          ) : recoverStorage && (
            <Button color="inherit" disabled={storageSaving} onClick={() => setConfirm("replace")}>
              {t("storage.replace")}
            </Button>
          )}
          {!conflict && storageSaveError && retryStorageSave && (
            <Button color="inherit" disabled={storageSaving} onClick={retryStorageSave}>
              {t("storage.retry")}
            </Button>
          )}
        </Stack>
      </Alert>
      {confirm === "replace" && recoverStorage && !conflict && (
        <DeleteConfirmDialog
          open
          title={t("storage.replace")}
          message={t("storage.replaceConfirm")}
          confirmLabel={t("storage.replace")}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            recoverStorage?.();
            setConfirm(null);
          }}
        />
      )}
      {confirm === "discard" && conflict && (
        <DeleteConfirmDialog
          open
          title={t("storage.loadLatest")}
          message={t("storage.discardConfirm")}
          confirmLabel={t("storage.discard")}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            if (discardStorageDraft()) window.location.reload();
          }}
        />
      )}
    </>
  );
}
