import { Alert, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { createPortal } from "react-dom";
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
import type { DurableSave } from "../../storage/pending-save.ts";
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
  storageTabOnlyDraft: boolean;
  storageDrafts: DurableSave[];
  openStorageDraft: (id: string) => boolean;
  exportStorageDraft: () => string;
  recoverStorage?: () => void;
  retryStorageSave?: () => void;
  discardStorageDraft: () => boolean;
  filename: string;
};

export function StorageProblem({
  storageLoadWarning, storageSaveError, storageOriginal, storageSaving, storageHasDraft,
  storageVolatileDraft, storageTabOnlyDraft, storageDrafts, openStorageDraft,
  exportStorageDraft, recoverStorage, retryStorageSave, discardStorageDraft, filename,
}: StorageProblemProps) {
  const { t, locale } = useTranslation();
  const [confirm, setConfirm] = useState<"replace" | "discard" | null>(null);
  const [openFailed, setOpenFailed] = useState(false);
  const availableDrafts = !storageHasDraft && storageDrafts.length > 0 ? (
    <Alert severity="info">
      {t("storage.savedDrafts")}
      {openFailed && <Typography>{t("storage.draftOpenFailed")}</Typography>}
      {storageDrafts.map(({ id, savedAt, raw }) => (
        <Stack key={id} direction="row" sx={{ flexWrap: "wrap" }}>
          <Button color="inherit" onClick={() => {
            if (openStorageDraft(id)) window.location.reload();
            else setOpenFailed(true);
          }}>{t("storage.openDraft", { date: new Date(savedAt).toLocaleString(locale) })}</Button>
          <Button color="inherit" onClick={() => downloadJson(raw, `${filename}-${id}.json`)}>{t("storage.downloadDraft")}</Button>
        </Stack>
      ))}
    </Alert>
  ) : null;
  if (!storageLoadWarning && !storageSaveError && !storageTabOnlyDraft) {
    if (availableDrafts) return availableDrafts;
    return storageSaving ? createPortal(
      <Alert severity="info" role="status" sx={{ position: "fixed", top: 8, right: 8, zIndex: "tooltip", py: 0, "& .MuiAlert-message": { py: 0.5 } }}>{t("storage.saving")}</Alert>,
      document.body,
    ) : null;
  }
  const conflict = storageSaveError === STORAGE_CONFLICT;
  const canDiscard = storageHasDraft && (conflict || (storageLoadWarning !== null && !recoverStorage));

  return (
    <>
      {availableDrafts}
      <Alert severity="error">
        {storageLoadWarning && <Typography variant="body2">{t(messages[storageLoadWarning])}</Typography>}
        {storageSaveError && storageSaveError !== storageLoadWarning && (
          <Typography variant="body2">{t(messages[storageSaveError])}</Typography>
        )}
        {storageTabOnlyDraft && <Typography variant="body2">{t(storageVolatileDraft ? "storage.volatileDraft" : "storage.tabOnlyDraft")}</Typography>}
        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: "wrap" }}>
          {storageOriginal != null && (
            <Button color="inherit" onClick={() => downloadJson(storageOriginal, `${filename}-original.json`)}>
              {t("storage.downloadOriginal")}
            </Button>
          )}
          <Button color="inherit" onClick={() => downloadJson(exportStorageDraft(), `${filename}-draft.json`)}>
            {t("storage.downloadDraft")}
          </Button>
          {conflict || canDiscard ? (
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
      {confirm === "discard" && canDiscard && (
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
