import { Stack, Typography } from "@mui/material";
import { Suspense, useCallback, useMemo } from "react";
import { useGearHintLegendDismissed } from "../../hooks/use-gear-hint-legend-dismissed.ts";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import type { TrackerFormsState } from "../../hooks/use-overlay-panels.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { StorageProblem } from "../storage-problem/index.tsx";
import { hideExternalWowTooltips } from "../../utils/hide-external-wow-tooltips.ts";
import { AppIntro } from "../app-intro/index.tsx";
import { CharacterForm } from "../character-form/index.tsx";
import { DataControlsPanel } from "../data-controls-panel/index.tsx";
import { DungeonForm } from "../dungeon-form/index.tsx";
import { GearHintLegend } from "../gear-hint-legend/index.tsx";
import { WowDataGate } from "../wow-data-gate/index.tsx";
import { TrackerToolbarPanel } from "../tracker-toolbar-panel/index.tsx";
import { resolveToolbarPanelId } from "../tracker-toolbar-panel/resolve-toolbar-panel-id.ts";
import { getToolbarPanelMeta } from "../tracker-toolbar-panel/toolbar-panel-meta.ts";
import {
  ResetCharacterPickFilters,
  ResetGearPickFilters,
  WorkspaceBisLists,
  WorkspaceCharacterPick,
  WorkspaceGearPick,
  WorkspaceRaidTable,
} from "./workspace-panels.tsx";

type RaidTrackerMainProps = {
  forms: TrackerFormsState;
  onAddFromTemplate: () => void;
  introVisible: boolean;
  onDismissIntro: () => void;
  showCharacterPickPanel: boolean;
  closeCharacterPickPanel: () => void;
  showGearPickPanel: boolean;
  closeGearPickPanel: () => void;
  showBisListsPanel: boolean;
  closeBisListsPanel: () => void;
  showDataControlsPanel: boolean;
  closeDataControlsPanel: () => void;
};

export function RaidTrackerMain({
  forms,
  onAddFromTemplate,
  introVisible,
  onDismissIntro,
  showCharacterPickPanel,
  closeCharacterPickPanel,
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

  const toolbarPanelId = resolveToolbarPanelId({
    showCharacterForm: forms.showCharacterForm,
    showDungeonForm: forms.showDungeonForm,
    showBisListsPanel,
    showCharacterPickPanel,
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

  const toolbarPanelMeta = useMemo(() => {
    if (!toolbarPanelId) {
      return null;
    }

    const meta = getToolbarPanelMeta(toolbarPanelId, t, {
      closeCharacterForm: forms.closeCharacterForm,
      closeDungeonForm: forms.closeDungeonForm,
      closeBisListsPanel: closeBisListsPanelWithTooltips,
      closeDataControlsPanel,
      closeCharacterPickPanel,
      closeGearPickPanel: closeGearPickPanelWithTooltips,
    });

    if (toolbarPanelId === "characterPick") {
      return {
        ...meta,
        headerActions: <ResetCharacterPickFilters />,
      };
    }

    if (toolbarPanelId === "gear") {
      return {
        ...meta,
        headerActions: <ResetGearPickFilters />,
      };
    }

    return meta;
  }, [
    closeBisListsPanelWithTooltips,
    closeDataControlsPanel,
    closeCharacterPickPanel,
    closeGearPickPanelWithTooltips,
    forms.closeCharacterForm,
    forms.closeDungeonForm,
    t,
    toolbarPanelId,
  ]);

  return (
    <Stack spacing={2}>
      <AppIntro visible={introVisible} onDismiss={onDismissIntro} />

      <StorageProblem {...domain} filename="raidwise-tracker" />

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

          <Suspense fallback={<Typography role="status">{t("appNavigation.loadingRaidTool")}</Typography>}>
            {showCharacterPickPanel ? <WorkspaceCharacterPick /> : null}
            {showGearPickPanel ? (
              <WowDataGate><WorkspaceGearPick /></WowDataGate>
            ) : null}
            {showBisListsPanel ? <WorkspaceBisLists /> : null}
          </Suspense>

          {showDataControlsPanel ? (
            <DataControlsPanel onAddFromTemplate={onAddFromTemplate} />
          ) : null}
        </TrackerToolbarPanel>
      ) : null}

      {showGearHintLegend ? (
        <GearHintLegend onDismiss={dismissGearHintLegend} />
      ) : null}

      <WorkspaceRaidTable
        onAddCharacter={forms.toggleCharacterForm}
        onAddDungeon={forms.toggleDungeonForm}
        characterFormOpen={forms.showCharacterForm}
        dungeonFormOpen={forms.showDungeonForm}
      />
    </Stack>
  );
}
