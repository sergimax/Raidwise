import { Box, Button } from "@mui/material";
import { useCallback, useState } from "react";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { DeleteConfirmDialog } from "../raid-tracker-table/delete-confirm-dialog.tsx";
import { ExportFilterSection } from "../export-panel/export-filter-section.tsx";
import {
  EXPORT_FILTER_GRID_GAP_SPACING,
  getDataControlsGridTemplateAreas,
  getDataControlsGridTemplateColumns,
  getDataControlsGridTemplateRows,
} from "./constants.ts";
import { DataControlsBlock } from "./data-controls-block.tsx";

type PendingDataAction =
  | "resetToggles"
  | "deleteCharacters"
  | "deleteDungeons"
  | "deleteBisLists";

type ConfirmCopy = {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: "warning" | "error";
};

type DataControlsPanelProps = {
  onAddFromTemplate: () => void;
};

/** Bulk reset / delete actions in a 2×2 unit-block grid. */
export function DataControlsPanel({
  onAddFromTemplate,
}: DataControlsPanelProps) {
  const { t } = useTranslation();
  const domain = useRaidTrackerContext();
  const bisLists = useBisListsContext();
  const [pendingAction, setPendingAction] = useState<PendingDataAction | null>(
    null,
  );

  const cancelPending = useCallback(() => {
    setPendingAction(null);
  }, []);

  const confirmPending = useCallback(() => {
    switch (pendingAction) {
      case "resetToggles":
        domain.handleResetAllToggles();
        break;
      case "deleteCharacters":
        domain.handleDeleteAllCharacters();
        break;
      case "deleteDungeons":
        domain.handleDeleteAllDungeons();
        break;
      case "deleteBisLists":
        bisLists.clearAllLocalPresets();
        break;
      default:
        break;
    }
    setPendingAction(null);
  }, [bisLists, domain, pendingAction]);

  const confirmCopy: ConfirmCopy | null = (() => {
    switch (pendingAction) {
      case "resetToggles":
        return {
          title: t("dataControlsPanel.resetTogglesConfirmTitle"),
          message: t("dataControlsPanel.resetTogglesConfirmMessage"),
          confirmLabel: t("dataControlsPanel.resetConfirm"),
          confirmColor: "warning",
        };
      case "deleteCharacters":
        return {
          title: t("dataControlsPanel.deleteCharactersConfirmTitle"),
          message: t("dataControlsPanel.deleteCharactersConfirmMessage"),
          confirmLabel: t("common.delete"),
          confirmColor: "error",
        };
      case "deleteDungeons":
        return {
          title: t("dataControlsPanel.deleteDungeonsConfirmTitle"),
          message: t("dataControlsPanel.deleteDungeonsConfirmMessage"),
          confirmLabel: t("common.delete"),
          confirmColor: "error",
        };
      case "deleteBisLists":
        return {
          title: t("dataControlsPanel.deleteBisConfirmTitle"),
          message: t("dataControlsPanel.deleteBisConfirmMessage"),
          confirmLabel: t("common.delete"),
          confirmColor: "error",
        };
      default:
        return null;
    }
  })();

  const hasDungeons = domain.dungeons.length > 0;

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: getDataControlsGridTemplateColumns(),
          },
          gridTemplateRows: {
            xs: "auto",
            sm: getDataControlsGridTemplateRows(),
          },
          gridTemplateAreas: {
            xs: "none",
            sm: getDataControlsGridTemplateAreas(),
          },
          gap: EXPORT_FILTER_GRID_GAP_SPACING,
          alignItems: "stretch",
          width: { xs: "100%", sm: "fit-content" },
          maxWidth: "100%",
        }}
      >
        <DataControlsBlock gridArea="resetToggles">
          <ExportFilterSection
            title={t("dataControlsPanel.resetTogglesTitle")}
            description={t("dataControlsPanel.resetTogglesDescription")}
          >
            <Button
              size="small"
              variant="outlined"
              color="warning"
              disabled={!domain.canResetAllToggles}
              onClick={() => setPendingAction("resetToggles")}
            >
              {t("toolbar.resetAllToggles")}
            </Button>
          </ExportFilterSection>
        </DataControlsBlock>

        <DataControlsBlock gridArea="deleteCharacters">
          <ExportFilterSection
            title={t("dataControlsPanel.deleteCharactersTitle")}
            description={t("dataControlsPanel.deleteCharactersDescription")}
          >
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={domain.characters.length === 0}
              onClick={() => setPendingAction("deleteCharacters")}
            >
              {t("dataControlsPanel.deleteCharactersAction")}
            </Button>
          </ExportFilterSection>
        </DataControlsBlock>

        <DataControlsBlock gridArea="deleteDungeons">
          <ExportFilterSection
            title={t("dataControlsPanel.deleteDungeonsTitle")}
            description={
              hasDungeons
                ? t("dataControlsPanel.deleteDungeonsDescription")
                : t("dataControlsPanel.addFromTemplateDescription")
            }
          >
            {hasDungeons ? (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => setPendingAction("deleteDungeons")}
              >
                {t("dataControlsPanel.deleteDungeonsAction")}
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={onAddFromTemplate}
              >
                {t("toolbar.addFromTemplate")}
              </Button>
            )}
          </ExportFilterSection>
        </DataControlsBlock>

        <DataControlsBlock gridArea="deleteBisLists">
          <ExportFilterSection
            title={t("dataControlsPanel.deleteBisTitle")}
            description={t("dataControlsPanel.deleteBisDescription")}
          >
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={!bisLists.hasAnyLocalBisPresets}
              onClick={() => setPendingAction("deleteBisLists")}
            >
              {t("dataControlsPanel.deleteBisAction")}
            </Button>
          </ExportFilterSection>
        </DataControlsBlock>
      </Box>

      {confirmCopy ? (
        <DeleteConfirmDialog
          open
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={confirmCopy.confirmLabel}
          confirmColor={confirmCopy.confirmColor}
          onConfirm={confirmPending}
          onCancel={cancelPending}
        />
      ) : null}
    </>
  );
}
