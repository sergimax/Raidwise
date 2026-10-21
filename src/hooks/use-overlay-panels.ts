import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { CharacterRecord } from "../types/characters.ts";
import type { DungeonRecord } from "../types/dungeons.ts";
import type { OverlayPanelId } from "./overlay-panel-id.ts";
import { APP_ROUTES, useAppRoute } from "../routing/app-route.ts";
import { useCharacterFormState } from "./use-character-form-state.ts";
import { useDungeonFormState } from "./use-dungeon-form-state.ts";

type UseOverlayPanelsOptions = {
  characters: CharacterRecord[];
  onCharacterAdded: (character: CharacterRecord) => void;
  onDungeonAdded: (dungeon: DungeonRecord) => void;
};

const routeByPanel: Record<OverlayPanelId, (typeof APP_ROUTES)[keyof typeof APP_ROUTES]> = {
  character: APP_ROUTES.addCharacter,
  dungeon: APP_ROUTES.addRaid,
  characterPick: APP_ROUTES.characterPick,
  gear: APP_ROUTES.gearPick,
  bis: APP_ROUTES.bisLists,
  data: APP_ROUTES.settings,
};

function getPanelForRoute(route: string): OverlayPanelId | null {
  return (
    (Object.entries(routeByPanel).find(([, panelRoute]) => panelRoute === route)?.[0] as OverlayPanelId | undefined) ?? null
  );
}

/** Toolbar tools are addressable routes; their selected panel follows browser history. */
export function useOverlayPanels({
  characters,
  onCharacterAdded,
  onDungeonAdded,
}: UseOverlayPanelsOptions) {
  const route = useAppRoute();
  const navigate = useNavigate();
  const activePanel = getPanelForRoute(route);

  const clearActivePanel = useCallback(() => navigate(APP_ROUTES.raids), [navigate]);
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
    navigate(APP_ROUTES.raids);
    characterForm.close();
    dungeonForm.close();
  }, [characterForm.close, dungeonForm.close, navigate]);

  const togglePanel = useCallback(
    (panelId: OverlayPanelId) => {
      if (activePanel === "character" || panelId === "character") {
        characterForm.close();
      }
      if (activePanel === "dungeon" || panelId === "dungeon") {
        dungeonForm.close();
      }
      navigate(activePanel === panelId ? APP_ROUTES.raids : routeByPanel[panelId]);
    },
    [activePanel, characterForm.close, dungeonForm.close, navigate],
  );

  const closePanel = useCallback(
    (panelId: OverlayPanelId) => {
      if (activePanel === panelId) navigate(APP_ROUTES.raids);
      if (panelId === "character") characterForm.close();
      if (panelId === "dungeon") dungeonForm.close();
    },
    [activePanel, characterForm.close, dungeonForm.close, navigate],
  );

  const showCharacterPickPanel = activePanel === "characterPick";
  const showGearPickPanel = activePanel === "gear";
  const showBisListsPanel = activePanel === "bis";
  const showDataControlsPanel = activePanel === "data";
  const showCharacterForm = activePanel === "character";
  const showDungeonForm = activePanel === "dungeon";

  const toggleCharacterPickPanel = useCallback(() => togglePanel("characterPick"), [togglePanel]);
  const toggleGearPickPanel = useCallback(() => togglePanel("gear"), [togglePanel]);
  const toggleBisListsPanel = useCallback(() => togglePanel("bis"), [togglePanel]);
  const toggleDataControlsPanel = useCallback(() => togglePanel("data"), [togglePanel]);
  const toggleCharacterForm = useCallback(() => togglePanel("character"), [togglePanel]);
  const toggleDungeonForm = useCallback(() => togglePanel("dungeon"), [togglePanel]);
  const closeCharacterPickPanel = useCallback(() => closePanel("characterPick"), [closePanel]);
  const closeGearPickPanel = useCallback(() => closePanel("gear"), [closePanel]);
  const closeBisListsPanel = useCallback(() => closePanel("bis"), [closePanel]);
  const closeDataControlsPanel = useCallback(() => closePanel("data"), [closePanel]);
  const closeCharacterForm = useCallback(() => closePanel("character"), [closePanel]);
  const closeDungeonForm = useCallback(() => closePanel("dungeon"), [closePanel]);

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
      closeCharacterPickPanel,
      closeDataControlsPanel,
      closeDungeonForm,
      closeGearPickPanel,
      dungeonForm,
      showBisListsPanel,
      showCharacterForm,
      showCharacterPickPanel,
      showDataControlsPanel,
      showDungeonForm,
      showGearPickPanel,
      toggleBisListsPanel,
      toggleCharacterForm,
      toggleCharacterPickPanel,
      toggleDataControlsPanel,
      toggleDungeonForm,
      toggleGearPickPanel,
    ],
  );
}

export type OverlayPanelsState = ReturnType<typeof useOverlayPanels>;

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

export function pickTrackerFormsState(overlayPanels: OverlayPanelsState): TrackerFormsState {
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
