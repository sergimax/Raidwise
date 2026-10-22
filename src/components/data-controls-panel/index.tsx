import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Box, Button } from "@mui/material";
import { useCallback, useState } from "react";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { DeleteConfirmDialog } from "../raid-tracker-table/delete-confirm-dialog.tsx";
import { FilterSection } from "../filter-unit/filter-section.tsx";
import {
  FILTER_UNIT_GRID_GAP_SPACING,
  FILTER_UNIT_HEIGHT,
  FILTER_UNIT_WIDTH,
} from "./constants.ts";
import { DataControlsBlock } from "./data-controls-block.tsx";

const DATA_CONTROLS_SECTION_SX = { p: 0.75 } as const;
const DATA_CONTROLS_ACTIONS_SX = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "flex-end",
} as const;

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
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${FILTER_UNIT_WIDTH}px), 1fr))`,
          gridAutoRows: { xs: "auto", sm: FILTER_UNIT_HEIGHT / 2 },
          gap: FILTER_UNIT_GRID_GAP_SPACING,
          alignItems: "stretch",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <DataControlsBlock>
          <FilterSection
            title={t("dataControlsPanel.resetTogglesTitle")}
            description={t("dataControlsPanel.resetTogglesDescription")}
            contentSx={DATA_CONTROLS_ACTIONS_SX}
            sx={DATA_CONTROLS_SECTION_SX}
          >
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<RestartAltIcon fontSize="small" />}
              disabled={!domain.canResetAllToggles}
              onClick={() => setPendingAction("resetToggles")}
            >
              {t("toolbar.resetAllToggles")}
            </Button>
          </FilterSection>
        </DataControlsBlock>

        <DataControlsBlock>
          <FilterSection
            title={t("dataControlsPanel.deleteCharactersTitle")}
            description={t("dataControlsPanel.deleteCharactersDescription")}
            contentSx={DATA_CONTROLS_ACTIONS_SX}
            sx={DATA_CONTROLS_SECTION_SX}
          >
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<PersonRemoveIcon fontSize="small" />}
              disabled={domain.characters.length === 0}
              onClick={() => setPendingAction("deleteCharacters")}
            >
              {t("dataControlsPanel.deleteCharactersAction")}
            </Button>
          </FilterSection>
        </DataControlsBlock>

        <DataControlsBlock>
          <FilterSection
            title={t("dataControlsPanel.deleteDungeonsTitle")}
            description={
              hasDungeons
                ? t("dataControlsPanel.deleteDungeonsDescription")
                : t("dataControlsPanel.addFromTemplateDescription")
            }
            contentSx={DATA_CONTROLS_ACTIONS_SX}
            sx={DATA_CONTROLS_SECTION_SX}
          >
            {hasDungeons ? (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon fontSize="small" />}
                onClick={() => setPendingAction("deleteDungeons")}
              >
                {t("dataControlsPanel.deleteDungeonsAction")}
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<LibraryAddIcon fontSize="small" />}
                onClick={onAddFromTemplate}
              >
                {t("toolbar.addFromTemplate")}
              </Button>
            )}
          </FilterSection>
        </DataControlsBlock>

        <DataControlsBlock>
          <FilterSection
            title={t("dataControlsPanel.deleteBisTitle")}
            description={t("dataControlsPanel.deleteBisDescription")}
            contentSx={DATA_CONTROLS_ACTIONS_SX}
            sx={DATA_CONTROLS_SECTION_SX}
          >
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<PlaylistRemoveIcon fontSize="small" />}
              disabled={!bisLists.hasAnyLocalBisPresets}
              onClick={() => setPendingAction("deleteBisLists")}
            >
              {t("dataControlsPanel.deleteBisAction")}
            </Button>
          </FilterSection>
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
