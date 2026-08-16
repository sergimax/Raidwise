import { Alert, Stack } from "@mui/material";
import { useCallback, useMemo } from "react";
import { useBisListsSessionState } from "../../hooks/use-bis-lists-session-state.ts";
import { useExportSessionState } from "../../hooks/use-export-session-state.ts";
import { useGearHintLegendDismissed } from "../../hooks/use-gear-hint-legend-dismissed.ts";
import { useGearPickSessionState } from "../../hooks/use-gear-pick-session-state.ts";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import type { TrackerFormsState } from "../../hooks/use-overlay-panels.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import { LOAD_WARNING_CORRUPTED_SAVE } from "../../storage/constants.ts";
import { hideExternalWowTooltips } from "../../utils/hide-external-wow-tooltips.ts";
import { AppIntro } from "../app-intro/index.tsx";
import { BisListsPanel } from "../bis-lists-panel/index.tsx";
import { CharacterForm } from "../character-form/index.tsx";
import { DataControlsPanel } from "../data-controls-panel/index.tsx";
import { DungeonForm } from "../dungeon-form/index.tsx";
import { ExportPanel } from "../export-panel/index.tsx";
import { ExportPanelHeaderActions } from "../export-panel/export-panel-header-actions.tsx";
import { GearHintLegend } from "../gear-hint-legend/index.tsx";
import { GearPickPanel } from "../gear-pick-panel/index.tsx";
import { RaidTrackerTable } from "../raid-tracker-table/index.tsx";
import { useRaidTrackerTableState } from "../raid-tracker-table/use-raid-tracker-table-state.ts";
import { TrackerToolbarPanel } from "../tracker-toolbar-panel/index.tsx";
import { resolveToolbarPanelId } from "../tracker-toolbar-panel/resolve-toolbar-panel-id.ts";
import { getToolbarPanelMeta } from "../tracker-toolbar-panel/toolbar-panel-meta.ts";

type RaidTrackerMainProps = {
  forms: TrackerFormsState;
  onAddFromTemplate: () => void;
  introVisible: boolean;
  onDismissIntro: () => void;
  showExportPanel: boolean;
  closeExportPanel: () => void;
  showGearPickPanel: boolean;
  closeGearPickPanel: () => void;
  showBisListsPanel: boolean;
  closeBisListsPanel: () => void;
  showDataControlsPanel: boolean;
  closeDataControlsPanel: () => void;
};

const STORAGE_QUOTA_MESSAGE = "Storage quota exceeded. Please free up space.";
const STORAGE_SAVE_FAILED_MESSAGE = "Failed to save data. Please try again.";

function localizeStorageMessage(message: string, t: TranslateFn): string {
  if (message === LOAD_WARNING_CORRUPTED_SAVE) {
    return t("storage.corrupted");
  }
  if (message === STORAGE_QUOTA_MESSAGE) {
    return t("storage.quotaExceeded");
  }
  if (message === STORAGE_SAVE_FAILED_MESSAGE) {
    return t("storage.saveFailed");
  }
  return message;
}

export function RaidTrackerMain({
  forms,
  onAddFromTemplate,
  introVisible,
  onDismissIntro,
  showExportPanel,
  closeExportPanel,
  showGearPickPanel,
  closeGearPickPanel,
  showBisListsPanel,
  closeBisListsPanel,
  showDataControlsPanel,
  closeDataControlsPanel,
}: RaidTrackerMainProps) {
  const { t } = useTranslation();
  const domain = useRaidTrackerContext();
  const { dismissed: gearHintLegendDismissed, dismiss: dismissGearHintLegend } =
    useGearHintLegendDismissed();
  const showGearHintLegend =
    !gearHintLegendDismissed &&
    domain.characters.length > 0 &&
    domain.dungeons.length > 0;

  const tableState = useRaidTrackerTableState({
    characters: domain.characters,
    dungeons: domain.dungeons,
    dungeonToggles: domain.dungeonToggles,
    onDeleteCharacter: domain.handleDeleteCharacter,
    onDeleteDungeon: domain.handleDeleteDungeon,
  });

  const gearPickSession = useGearPickSessionState();
  const exportSession = useExportSessionState();
  const bisListsSession = useBisListsSessionState();
  const { resetAllFilters: resetExportSessionFilters } = exportSession;
  const { resetAllFilters: resetGearPickSessionFilters } = gearPickSession;
  const { setDungeonNameSearch } = tableState;

  const toolbarPanelId = resolveToolbarPanelId({
    showCharacterForm: forms.showCharacterForm,
    showDungeonForm: forms.showDungeonForm,
    showBisListsPanel,
    showExportPanel,
    showGearPickPanel,
    showDataControlsPanel,
  });

  const closeBisListsPanelWithTooltips = useCallback(() => {
    hideExternalWowTooltips();
    closeBisListsPanel();
  }, [closeBisListsPanel]);

  const closeGearPickPanelWithTooltips = useCallback(() => {
    hideExternalWowTooltips();
    closeGearPickPanel();
  }, [closeGearPickPanel]);

  const resetExportAllFilters = useCallback(() => {
    resetExportSessionFilters();
    setDungeonNameSearch("");
  }, [resetExportSessionFilters, setDungeonNameSearch]);

  const resetGearPickAllFilters = useCallback(() => {
    resetGearPickSessionFilters();
    setDungeonNameSearch("");
  }, [resetGearPickSessionFilters, setDungeonNameSearch]);

  const toolbarPanelMeta = useMemo(() => {
    if (!toolbarPanelId) {
      return null;
    }

    const meta = getToolbarPanelMeta(toolbarPanelId, t, {
      closeCharacterForm: forms.closeCharacterForm,
      closeDungeonForm: forms.closeDungeonForm,
      closeBisListsPanel: closeBisListsPanelWithTooltips,
      closeDataControlsPanel,
      closeExportPanel,
      closeGearPickPanel: closeGearPickPanelWithTooltips,
    });

    if (toolbarPanelId === "export") {
      return {
        ...meta,
        headerActions: (
          <ExportPanelHeaderActions onResetAllFilters={resetExportAllFilters} />
        ),
      };
    }

    if (toolbarPanelId === "gear") {
      return {
        ...meta,
        headerActions: (
          <ExportPanelHeaderActions onResetAllFilters={resetGearPickAllFilters} />
        ),
      };
    }

    return meta;
  }, [
    closeBisListsPanelWithTooltips,
    closeDataControlsPanel,
    closeExportPanel,
    closeGearPickPanelWithTooltips,
    forms.closeCharacterForm,
    forms.closeDungeonForm,
    resetExportAllFilters,
    resetGearPickAllFilters,
    t,
    toolbarPanelId,
  ]);

  return (
    <Stack spacing={2}>
      <AppIntro visible={introVisible} onDismiss={onDismissIntro} />

      {domain.storageError ? (
        <Alert severity="error">
          {localizeStorageMessage(domain.storageError, t)}
        </Alert>
      ) : null}

      {toolbarPanelId && toolbarPanelMeta ? (
        <TrackerToolbarPanel panelId={toolbarPanelId} {...toolbarPanelMeta}>
          {forms.showCharacterForm ? (
            <CharacterForm
              name={forms.characterForm.name}
              characterClass={forms.characterForm.characterClass}
              mainSpec={forms.characterForm.mainSpec}
              mainGearScoreText={forms.characterForm.mainGearScoreText}
              offSpec={forms.characterForm.offSpec}
              offGearScoreText={forms.characterForm.offGearScoreText}
              mainGearItems={forms.characterForm.mainGearItems}
              offGearItems={forms.characterForm.offGearItems}
              error={forms.characterForm.error}
              onNameChange={forms.characterForm.setName}
              onClassChange={forms.characterForm.setCharacterClass}
              onMainSpecChange={forms.characterForm.setMainSpec}
              onMainGearScoreTextChange={forms.characterForm.setMainGearScoreText}
              onOffSpecChange={forms.characterForm.setOffSpec}
              onOffGearScoreTextChange={forms.characterForm.setOffGearScoreText}
              onMainGearItemsChange={forms.characterForm.setMainGearItems}
              onOffGearItemsChange={forms.characterForm.setOffGearItems}
              onImportError={forms.characterForm.setFormError}
              onClearImportError={forms.characterForm.clearError}
              onSubmit={forms.characterForm.handleSubmit}
            />
          ) : null}

          {forms.showDungeonForm ? (
            <DungeonForm
              name={forms.dungeonForm.name}
              shortName={forms.dungeonForm.shortName}
              size={forms.dungeonForm.size}
              itemLevelText={forms.dungeonForm.itemLevelText}
              difficulty={forms.dungeonForm.difficulty}
              error={forms.dungeonForm.error}
              onNameChange={forms.dungeonForm.setName}
              onShortNameChange={forms.dungeonForm.setShortName}
              onSizeChange={forms.dungeonForm.setSize}
              onItemLevelTextChange={forms.dungeonForm.setItemLevelText}
              onDifficultyChange={forms.dungeonForm.setDifficulty}
              onSubmit={forms.dungeonForm.handleSubmit}
            />
          ) : null}

          {showExportPanel ? (
            <ExportPanel
              characters={domain.characters}
              visibleDungeons={tableState.sortedDungeons}
              dungeonToggles={domain.dungeonToggles}
              dungeonNameSearch={tableState.dungeonNameSearch}
              onDungeonNameSearchChange={tableState.setDungeonNameSearch}
              totalDungeonCount={tableState.dungeonCount}
              session={exportSession}
            />
          ) : null}

          {showGearPickPanel ? (
            <GearPickPanel
              characters={domain.characters}
              visibleDungeons={tableState.sortedDungeons}
              dungeonToggles={domain.dungeonToggles}
              dungeonNameSearch={tableState.dungeonNameSearch}
              onDungeonNameSearchChange={tableState.setDungeonNameSearch}
              totalDungeonCount={tableState.dungeonCount}
              session={gearPickSession}
            />
          ) : null}

          {showBisListsPanel ? <BisListsPanel session={bisListsSession} /> : null}

          {showDataControlsPanel ? (
            <DataControlsPanel onAddFromTemplate={onAddFromTemplate} />
          ) : null}
        </TrackerToolbarPanel>
      ) : null}

      {showGearHintLegend ? (
        <GearHintLegend onDismiss={dismissGearHintLegend} />
      ) : null}

      <RaidTrackerTable tableState={tableState} />
    </Stack>
  );
}
