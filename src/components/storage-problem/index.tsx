import { Alert, Button, Stack } from "@mui/material";
import { useState } from "react";
import { useTranslation, type MessageKey } from "../../i18n/use-translation.ts";
import {
  LOAD_WARNING_CORRUPTED_SAVE,
  LOAD_WARNING_UNSUPPORTED_SAVE,
  STORAGE_CONFLICT,
  STORAGE_READ_FAILED,
} from "../../storage/constants.ts";
import { DeleteConfirmDialog } from "../raid-tracker-table/delete-confirm-dialog.tsx";

const messages: Record<string, MessageKey> = {
  [LOAD_WARNING_CORRUPTED_SAVE]: "storage.corrupted",
  [LOAD_WARNING_UNSUPPORTED_SAVE]: "storage.unsupported",
  [STORAGE_CONFLICT]: "storage.conflict",
  [STORAGE_READ_FAILED]: "storage.readFailed",
  "Storage quota exceeded. Please free up space.": "storage.quotaExceeded",
  "Failed to save data. Please try again.": "storage.saveFailed",
};

function downloadSave(raw: string, filename: string) {
  const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type StorageProblemProps = {
  storageError: string | null;
  storageOriginal: string | null | undefined;
  exportStorageDraft: () => string;
  recoverStorage?: () => void;
  filename: string;
};

export function StorageProblem({
  storageError, storageOriginal, exportStorageDraft, recoverStorage, filename,
}: StorageProblemProps) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(false);
  if (!storageError) return null;
  const conflict = storageError === STORAGE_CONFLICT;
  const message = messages[storageError];

  return (
    <>
      <Alert severity="error">
        {message ? t(message) : storageError}
        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: "wrap" }}>
          {storageOriginal != null && (
            <Button color="inherit" onClick={() => downloadSave(storageOriginal, `${filename}-original.json`)}>
              {t("storage.downloadOriginal")}
            </Button>
          )}
          <Button color="inherit" onClick={() => downloadSave(exportStorageDraft(), `${filename}-draft.json`)}>
            {t("storage.downloadDraft")}
          </Button>
          {conflict ? (
            <Button color="inherit" onClick={() => window.location.reload()}>
              {t("storage.loadLatest")}
            </Button>
          ) : recoverStorage && (
            <Button color="inherit" onClick={() => setConfirm(true)}>
              {t("storage.replace")}
            </Button>
          )}
        </Stack>
      </Alert>
      {confirm && (
        <DeleteConfirmDialog
          open
          title={t("storage.replace")}
          message={t("storage.replaceConfirm")}
          confirmLabel={t("storage.replace")}
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            recoverStorage?.();
            setConfirm(false);
          }}
        />
      )}
    </>
  );
}
