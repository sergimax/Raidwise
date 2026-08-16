import { Container } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useAppIntroVisibility } from "../../hooks/use-app-intro-visibility.ts";
import {
  pickTrackerFormsState,
  useOverlayPanels,
} from "../../hooks/use-overlay-panels.ts";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { AppHeader } from "../app-header/index.tsx";
import { DeleteConfirmDialog } from "../raid-tracker-table/delete-confirm-dialog.tsx";
import { RaidTrackerMain } from "../raid-tracker-main/index.tsx";
import { TrackerControls } from "../tracker-controls/index.tsx";
import type { TrackerControlsSource } from "../tracker-controls/types.ts";

export function TrackerLayout() {
  const { t } = useTranslation();
  const domain = useRaidTrackerContext();
  const overlayPanels = useOverlayPanels({
    characters: domain.characters,
    onCharacterAdded: domain.addCharacter,
    onDungeonAdded: domain.addDungeon,
  });
  const forms = pickTrackerFormsState(overlayPanels);
  const appIntro = useAppIntroVisibility({
    isEmptyTracker:
      domain.characters.length === 0 && domain.dungeons.length === 0,
  });
  const [confirmAddFromTemplateOpen, setConfirmAddFromTemplateOpen] =
    useState(false);

  const requestAddFromTemplate = useCallback(() => {
    overlayPanels.closeAllOverlayPanels();
    setConfirmAddFromTemplateOpen(true);
  }, [overlayPanels]);

  const cancelAddFromTemplate = useCallback(() => {
    setConfirmAddFromTemplateOpen(false);
  }, []);

  const confirmAddFromTemplate = useCallback(() => {
    domain.handleAddFromTemplate();
    setConfirmAddFromTemplateOpen(false);
  }, [domain]);

  const controlsSource = useMemo(
    (): TrackerControlsSource => ({
      charactersCount: domain.characters.length,
      dungeonsCount: domain.dungeons.length,
      handleAddFromTemplate: requestAddFromTemplate,
      showCharacterForm: overlayPanels.showCharacterForm,
      showDungeonForm: overlayPanels.showDungeonForm,
      showCharacterPickPanel: overlayPanels.showCharacterPickPanel,
      showGearPickPanel: overlayPanels.showGearPickPanel,
      showBisListsPanel: overlayPanels.showBisListsPanel,
      showDataControlsPanel: overlayPanels.showDataControlsPanel,
      toggleCharacterForm: overlayPanels.toggleCharacterForm,
      toggleDungeonForm: overlayPanels.toggleDungeonForm,
      toggleCharacterPickPanel: overlayPanels.toggleCharacterPickPanel,
      toggleGearPickPanel: overlayPanels.toggleGearPickPanel,
      toggleBisListsPanel: overlayPanels.toggleBisListsPanel,
      toggleDataControlsPanel: overlayPanels.toggleDataControlsPanel,
    }),
    [
      domain.characters.length,
      domain.dungeons.length,
      requestAddFromTemplate,
      overlayPanels.showBisListsPanel,
      overlayPanels.showCharacterForm,
      overlayPanels.showDataControlsPanel,
      overlayPanels.showDungeonForm,
      overlayPanels.showCharacterPickPanel,
      overlayPanels.showGearPickPanel,
      overlayPanels.toggleBisListsPanel,
      overlayPanels.toggleCharacterForm,
      overlayPanels.toggleDataControlsPanel,
      overlayPanels.toggleDungeonForm,
      overlayPanels.toggleCharacterPickPanel,
      overlayPanels.toggleGearPickPanel,
    ],
  );

  return (
    <div className="app-shell">
      <AppHeader
        center={<TrackerControls source={controlsSource} />}
        introVisible={appIntro.visible}
        onToggleIntro={appIntro.toggle}
      />
      <Container
        className="app-main"
        component="main"
        maxWidth={false}
        disableGutters
      >
        <RaidTrackerMain
          forms={forms}
          onAddFromTemplate={requestAddFromTemplate}
          introVisible={appIntro.visible}
          onDismissIntro={appIntro.dismiss}
          showCharacterPickPanel={overlayPanels.showCharacterPickPanel}
          closeCharacterPickPanel={overlayPanels.closeCharacterPickPanel}
          showGearPickPanel={overlayPanels.showGearPickPanel}
          closeGearPickPanel={overlayPanels.closeGearPickPanel}
          showBisListsPanel={overlayPanels.showBisListsPanel}
          closeBisListsPanel={overlayPanels.closeBisListsPanel}
          showDataControlsPanel={overlayPanels.showDataControlsPanel}
          closeDataControlsPanel={overlayPanels.closeDataControlsPanel}
        />
      </Container>
      {confirmAddFromTemplateOpen ? (
        <DeleteConfirmDialog
          open
          title={t("dataControlsPanel.addFromTemplateConfirmTitle")}
          message={t("dataControlsPanel.addFromTemplateConfirmMessage")}
          confirmLabel={t("dataControlsPanel.addFromTemplateConfirm")}
          confirmColor="secondary"
          onConfirm={confirmAddFromTemplate}
          onCancel={cancelAddFromTemplate}
        />
      ) : null}
    </div>
  );
}
