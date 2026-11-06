import { useTranslation } from "../../i18n/use-translation.ts";
import { DeleteConfirmDialog } from "./delete-confirm-dialog.tsx";
import { getRaidTrackerDeleteDialogProps } from "./raid-tracker-delete-dialog.ts";
import type { RaidTrackerPendingDelete } from "../../types/raid-tracker-table.ts";

type RaidTrackerDeleteDialogProps = {
  pendingDelete: RaidTrackerPendingDelete | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function RaidTrackerDeleteDialog({
  pendingDelete,
  onConfirm,
  onCancel,
}: RaidTrackerDeleteDialogProps) {
  const { t } = useTranslation();
  const { title, message, confirmLabel } =
    getRaidTrackerDeleteDialogProps(pendingDelete, t);

  return (
    <DeleteConfirmDialog
      open={pendingDelete !== null}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
