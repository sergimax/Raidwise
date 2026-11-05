import type { TranslateFn } from "../../i18n/translate.ts";
import type { RaidTrackerPendingDelete } from "../../types/raid-tracker-table.ts";

export type RaidTrackerDeleteDialogContent = {
  title: string;
  message: string;
  confirmLabel: string;
};

const EMPTY_DIALOG_CONTENT: RaidTrackerDeleteDialogContent = {
  title: "",
  message: "",
  confirmLabel: "",
};

export function getRaidTrackerDeleteDialogProps(
  pendingDelete: RaidTrackerPendingDelete | null,
  t: TranslateFn,
): RaidTrackerDeleteDialogContent {
  if (pendingDelete === null) {
    return EMPTY_DIALOG_CONTENT;
  }

  if (pendingDelete.kind === "character") {
    return {
      title: t("deleteDialog.removeCharacterTitle"),
      message: t("deleteDialog.removeCharacterMessage", {
        name: pendingDelete.name,
      }),
      confirmLabel: t("common.remove"),
    };
  }

  return {
    title: t("deleteDialog.deleteDungeonTitle"),
    message: t("deleteDialog.deleteDungeonMessage", { name: pendingDelete.name }),
    confirmLabel: t("common.delete"),
  };
}
