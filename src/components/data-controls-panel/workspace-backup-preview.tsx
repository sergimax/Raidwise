import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from "@mui/material";
import { useTranslation, type MessageKey } from "../../i18n/use-translation.ts";
import type { WorkspaceSummary } from "../../storage/workspace-backup.ts";

const counts: Record<keyof WorkspaceSummary, MessageKey> = {
  characters: "workspaceBackup.characters",
  raids: "workspaceBackup.raids",
  cooldowns: "workspaceBackup.cooldowns",
  bisLists: "workspaceBackup.bisLists",
};

type WorkspaceBackupPreviewProps = {
  filename: string;
  current: WorkspaceSummary;
  incoming: WorkspaceSummary;
  restoring: boolean;
  blocked: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function WorkspaceBackupPreview({ filename, current, incoming, restoring, blocked, error,
  onCancel, onConfirm }: WorkspaceBackupPreviewProps) {
  const { t } = useTranslation();
  return (
    <Dialog open fullWidth maxWidth="sm" onClose={restoring ? undefined : onCancel}
      aria-labelledby="workspace-backup-title" aria-describedby="workspace-backup-replace">
      <DialogTitle id="workspace-backup-title">{t("workspaceBackup.preview")}</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Typography sx={{ overflowWrap: "anywhere" }}>{filename}</Typography>
          <DialogContentText id="workspace-backup-replace">{t("workspaceBackup.replace")}</DialogContentText>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>{t("workspaceBackup.contents")}</TableCell>
              <TableCell align="right">{t("workspaceBackup.current")}</TableCell>
              <TableCell align="right">{t("workspaceBackup.incoming")}</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {(Object.keys(counts) as (keyof WorkspaceSummary)[]).map((key) => <TableRow key={key}>
                <TableCell component="th" scope="row">{t(counts[key])}</TableCell>
                <TableCell align="right">{current[key]}</TableCell>
                <TableCell align="right">{incoming[key]}</TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
          {(error || blocked) && <Alert severity="error">{error ?? t("workspaceBackup.blocked")}</Alert>}
          {restoring && <Typography role="status">{t("workspaceBackup.restoring")}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={restoring} onClick={onCancel}>{t("common.cancel")}</Button>
        <Button color="warning" variant="contained" disabled={restoring || blocked} onClick={onConfirm}>
          {t("workspaceBackup.restore")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
