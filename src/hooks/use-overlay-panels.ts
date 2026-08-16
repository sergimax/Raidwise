import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CharacterRecord } from "../types/characters.ts";
import type { DungeonRecord } from "../types/dungeons.ts";
import type { OverlayPanelId } from "./overlay-panel-id.ts";
import { useCharacterFormState } from "./use-character-form-state.ts";
import { useDungeonFormState } from "./use-dungeon-form-state.ts";

type UseOverlayPanelsOptions = {
  characters: CharacterRecord[];
  onCharacterAdded: (character: CharacterRecord) => void;
  onDungeonAdded: (dungeon: DungeonRecord) => void;
};

/**
 * Toolbar overlays share one `activePanel` id (character | dungeon | characterPick | gear | bis | data).
 * Derived `show*` flags keep the existing TrackerControls / RaidTrackerMain API.
 * Form field state still lives in the form hooks; `onSubmitted` clears the panel
 * after a successful add so submit does not leave a stale active id.
 */
export function useOverlayPanels({
  characters,
  onCharacterAdded,
  onDungeonAdded,
}: UseOverlayPanelsOptions) {
  const [activePanel, setActivePanel] = useState<OverlayPanelId | null>(null);
  /** Latest panel id for toggles without re-creating callbacks every open/close. */
  const activePanelRef = useRef<OverlayPanelId | null>(null);

  useEffect(() => {
    activePanelRef.current = activePanel;
  }, [activePanel]);

  const clearActivePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const characterForm = useCharacterFormState({
    characters,
    onCharacterAdded,
    onSubmitted: clearActivePanel,
  });
  const dungeonForm = useDungeonFormState({
    onDungeonAdded,
    onSubmitted: clearActivePanel,
  });

  const closeAllOverlayPanels = useCallback(() => {
    setActivePanel(null);
    characterForm.close();
    dungeonForm.close();
  }, [characterForm, dungeonForm]);

  /** Open `panelId`, or close it if already active. Always closes the other form. */
  const togglePanel = useCallback(
    (panelId: OverlayPanelId) => {
      const current = activePanelRef.current;
      if (current === panelId) {
        setActivePanel(null);
        if (panelId === "character") {
          characterForm.close();
        } else if (panelId === "dungeon") {
          dungeonForm.close();
        }
        return;
      }

      if (panelId === "character") {
        dungeonForm.close();
        characterForm.open();
      } else if (panelId === "dungeon") {
        characterForm.close();
        dungeonForm.open();
      } else {
        characterForm.close();
        dungeonForm.close();
      }
      setActivePanel(panelId);
    },
    [characterForm, dungeonForm],
  );

  const showCharacterPickPanel = activePanel === "characterPick";
  const showGearPickPanel = activePanel === "gear";
  const showBisListsPanel = activePanel === "bis";
  const showDataControlsPanel = activePanel === "data";
  const showCharacterForm = activePanel === "character";
  const showDungeonForm = activePanel === "dungeon";

  const toggleCharacterPickPanel = useCallback(() => {
    togglePanel("characterPick");
  }, [togglePanel]);

  const toggleGearPickPanel = useCallback(() => {
    togglePanel("gear");
  }, [togglePanel]);

  const toggleBisListsPanel = useCallback(() => {
    togglePanel("bis");
  }, [togglePanel]);

  const toggleDataControlsPanel = useCallback(() => {
    togglePanel("data");
  }, [togglePanel]);

  const toggleCharacterForm = useCallback(() => {
    togglePanel("character");
  }, [togglePanel]);

  const toggleDungeonForm = useCallback(() => {
    togglePanel("dungeon");
  }, [togglePanel]);

  const closeCharacterPickPanel = useCallback(() => {
    if (activePanelRef.current === "characterPick") {
      setActivePanel(null);
    }
  }, []);

  const closeGearPickPanel = useCallback(() => {
    if (activePanelRef.current === "gear") {
      setActivePanel(null);
    }
  }, []);

  const closeBisListsPanel = useCallback(() => {
    if (activePanelRef.current === "bis") {
      setActivePanel(null);
    }
  }, []);

  const closeDataControlsPanel = useCallback(() => {
    if (activePanelRef.current === "data") {
      setActivePanel(null);
    }
  }, []);

  const closeCharacterForm = useCallback(() => {
    if (activePanelRef.current === "character") {
      setActivePanel(null);
    }
    characterForm.close();
  }, [characterForm]);

  const closeDungeonForm = useCallback(() => {
    if (activePanelRef.current === "dungeon") {
      setActivePanel(null);
    }
    dungeonForm.close();
  }, [dungeonForm]);

  return useMemo(
    () => ({
      showCharacterPickPanel,
      closeCharacterPickPanel,
      toggleCharacterPickPanel,
      showGearPickPanel,
      closeGearPickPanel,
      toggleGearPickPanel,
      showBisListsPanel,
      closeBisListsPanel,
      toggleBisListsPanel,
      showDataControlsPanel,
      closeDataControlsPanel,
      toggleDataControlsPanel,
      closeAllOverlayPanels,
      showCharacterForm,
      showDungeonForm,
      closeCharacterForm,
      closeDungeonForm,
      toggleCharacterForm,
      toggleDungeonForm,
      characterForm,
      dungeonForm,
    }),
    [
      characterForm,
      closeAllOverlayPanels,
      closeBisListsPanel,
      closeCharacterForm,
      closeDataControlsPanel,
      closeDungeonForm,
      closeCharacterPickPanel,
      closeGearPickPanel,
      dungeonForm,
      showBisListsPanel,
      showCharacterForm,
      showDataControlsPanel,
      showDungeonForm,
      showCharacterPickPanel,
      showGearPickPanel,
      toggleBisListsPanel,
      toggleCharacterForm,
      toggleDataControlsPanel,
      toggleDungeonForm,
      toggleCharacterPickPanel,
      toggleGearPickPanel,
    ],
  );
}

export type OverlayPanelsState = ReturnType<typeof useOverlayPanels>;

/** Form fields and toggles exposed to RaidTrackerMain (subset of overlay panel state). */
export type TrackerFormsState = Pick<
  OverlayPanelsState,
  | "showCharacterForm"
  | "showDungeonForm"
  | "closeCharacterForm"
  | "closeDungeonForm"
  | "toggleCharacterForm"
  | "toggleDungeonForm"
  | "characterForm"
  | "dungeonForm"
>;

export function pickTrackerFormsState(
  overlayPanels: OverlayPanelsState,
): TrackerFormsState {
  return {
    showCharacterForm: overlayPanels.showCharacterForm,
    showDungeonForm: overlayPanels.showDungeonForm,
    closeCharacterForm: overlayPanels.closeCharacterForm,
    closeDungeonForm: overlayPanels.closeDungeonForm,
    toggleCharacterForm: overlayPanels.toggleCharacterForm,
    toggleDungeonForm: overlayPanels.toggleDungeonForm,
    characterForm: overlayPanels.characterForm,
    dungeonForm: overlayPanels.dungeonForm,
  };
}
