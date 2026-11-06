import { Alert, Button, Stack } from "@mui/material";
import { useRef, useState, type ChangeEvent } from "react";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import { useTranslation, type MessageKey } from "../../i18n/use-translation.ts";
import type { SaveError } from "../../storage/local-save.ts";
import {
  createWorkspaceBackup,
  MAX_BACKUP_BYTES,
  parseWorkspaceBackup,
  restoreWorkspaceBackup,
  summarizeWorkspace,
  type WorkspaceBackup,
  type WorkspaceSnapshots,
} from "../../storage/workspace-backup.ts";
import { downloadJson } from "../../utils/download-json.ts";
import { FilterSection } from "../filter-unit/filter-section.tsx";
import { WorkspaceBackupPreview } from "./workspace-backup-preview.tsx";

type Preview = { filename: string; backup: WorkspaceBackup; expected: WorkspaceSnapshots | null };

const restoreErrors: Record<SaveError, MessageKey> = {
  "storage-conflict": "workspaceBackup.conflict",
  "storage-lock-unavailable": "storage.lockUnavailable",
  "storage-read-failed": "workspaceBackup.blocked",
  "storage-quota-exceeded": "workspaceBackup.quotaExceeded",
  "storage-write-failed": "workspaceBackup.writeFailed",
};

export function WorkspaceBackupControls() {
  const { t } = useTranslation();
  const tracker = useRaidTrackerContext();
  const bisLists = useBisListsContext();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<MessageKey | null>(null);
  const [reading, setReading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const canExport = !tracker.storageLoadWarning && !bisLists.storageLoadWarning;

  function workingSave() {
    return { tracker: tracker.exportStorageDraft(), bisLists: bisLists.exportStorageDraft() };
  }

  function currentSnapshots(): WorkspaceSnapshots | null {
    const trackerSnapshot = tracker.getRestoreSnapshot();
    const bisSnapshot = bisLists.getRestoreSnapshot();
    return trackerSnapshot && bisSnapshot ? { tracker: trackerSnapshot, bisLists: bisSnapshot } : null;
  }

  function downloadBackup() {
    setError(null);
    try {
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(createWorkspaceBackup(workingSave()), `raidwise-backup-${date}.json`);
    } catch {
      setError("workspaceBackup.downloadFailed");
    }
  }

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setError(null);
    if (file.size > MAX_BACKUP_BYTES) {
      setError("workspaceBackup.tooLarge");
      return;
    }
    const expected = currentSnapshots();
    setReading(true);
    try {
      const result = parseWorkspaceBackup(await file.text());
      if (result.ok) {
        setPreview({ filename: file.name, backup: result.backup, expected });
      } else {
        setError(result.error === "unsupported" ? "workspaceBackup.unsupported" : "workspaceBackup.invalid");
      }
    } catch {
      setError("workspaceBackup.readFailed");
    } finally {
      setReading(false);
    }
  }

  async function confirmRestore() {
    if (!preview?.expected || restoring) return;
    setError(null);
    setRestoring(true);
    const failure = await restoreWorkspaceBackup(preview.backup, preview.expected, currentSnapshots);
    if (failure) {
      setError(restoreErrors[failure]);
      setRestoring(false);
      return;
    }
    window.location.reload();
  }

  return (
    <FilterSection title={t("workspaceBackup.title")} description={t("workspaceBackup.description")}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Button size="small" variant="outlined" disabled={!canExport} onClick={downloadBackup}>
            {t("workspaceBackup.download")}
          </Button>
          <Button size="small" variant="outlined" disabled={reading} onClick={() => input.current?.click()}>
            {t("workspaceBackup.chooseFile")}
          </Button>
          <input ref={input} type="file" accept=".json,application/json" hidden
            aria-label={t("workspaceBackup.chooseFile")} onChange={(event) => { void selectFile(event); }} />
        </Stack>
        {reading && <span role="status">{t("workspaceBackup.reading")}</span>}
        {!canExport && <Alert severity="warning">{t("workspaceBackup.exportBlocked")}</Alert>}
        {error && !preview && <Alert severity="error">{t(error)}</Alert>}
      </Stack>
      {preview && <WorkspaceBackupPreview
        filename={preview.filename}
        current={summarizeWorkspace(workingSave())}
        incoming={preview.backup.summary}
        restoring={restoring}
        blocked={!preview.expected}
        error={error ? t(error) : null}
        onCancel={() => {
          setError(null);
          setPreview(null);
        }}
        onConfirm={() => { void confirmRestore(); }}
      />}
    </FilterSection>
  );
}
