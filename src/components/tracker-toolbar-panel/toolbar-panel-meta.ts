import type { ReactNode } from "react";
import type { TranslateFn } from "../../i18n/translate.ts";
import {
  TRACKER_CHARACTER_FORM_PANEL_MAX_WIDTH,
  TRACKER_DATA_CONTROLS_PANEL_MAX_WIDTH,
  TRACKER_DUNGEON_FORM_PANEL_MAX_WIDTH,
  TRACKER_UNIT_GRID_PANEL_MAX_WIDTH,
  TRACKER_WIDE_PANEL_MAX_WIDTH,
} from "./constants.ts";
import type { MainToolbarPanelId, ToolbarPanelId } from "./resolve-toolbar-panel-id.ts";

export type ToolbarPanelMeta = {
  title: string;
  description?: string;
  descriptionTooltip?: string;
  closeAriaLabel: string;
  onClose: () => void;
  headerActions?: ReactNode;
  maxWidth?: number;
};

type MainToolbarPanelHandlers = {
  closeCharacterForm: () => void;
  closeDungeonForm: () => void;
  closeBisListsPanel: () => void;
  closeDataControlsPanel: () => void;
};

type ToolbarPanelHandlers = MainToolbarPanelHandlers & {
  closeExportPanel: () => void;
  closeGearPickPanel: () => void;
};

export function getToolbarPanelMeta(
  panelId: ToolbarPanelId,
  t: TranslateFn,
  handlers: ToolbarPanelHandlers,
): ToolbarPanelMeta {
  if (panelId === "export") {
    return getExportToolbarPanelMeta(t, handlers.closeExportPanel);
  }
  if (panelId === "gear") {
    return getGearPickToolbarPanelMeta(t, handlers.closeGearPickPanel);
  }
  return getMainToolbarPanelMeta(panelId, t, handlers);
}

function getMainToolbarPanelMeta(
  panelId: MainToolbarPanelId,
  t: TranslateFn,
  handlers: MainToolbarPanelHandlers,
): ToolbarPanelMeta {
  switch (panelId) {
    case "character":
      return {
        title: t("characterForm.title"),
        closeAriaLabel: t("characterForm.closeAria"),
        onClose: handlers.closeCharacterForm,
        maxWidth: TRACKER_CHARACTER_FORM_PANEL_MAX_WIDTH,
      };
    case "dungeon":
      return {
        title: t("dungeonForm.title"),
        closeAriaLabel: t("dungeonForm.closeAria"),
        onClose: handlers.closeDungeonForm,
        maxWidth: TRACKER_DUNGEON_FORM_PANEL_MAX_WIDTH,
      };
    case "bis":
      return {
        title: t("bisPanel.title"),
        closeAriaLabel: t("bisPanel.closeAria"),
        onClose: handlers.closeBisListsPanel,
        maxWidth: TRACKER_WIDE_PANEL_MAX_WIDTH,
      };
    case "data":
      return {
        title: t("dataControlsPanel.title"),
        description: t("dataControlsPanel.description"),
        closeAriaLabel: t("dataControlsPanel.closeAria"),
        onClose: handlers.closeDataControlsPanel,
        maxWidth: TRACKER_DATA_CONTROLS_PANEL_MAX_WIDTH,
      };
  }
}

function getExportToolbarPanelMeta(
  t: TranslateFn,
  onClose: () => void,
): ToolbarPanelMeta {
  return {
    title: t("exportPanel.title"),
    closeAriaLabel: t("exportPanel.closeAria"),
    onClose,
    maxWidth: TRACKER_UNIT_GRID_PANEL_MAX_WIDTH,
  };
}

function getGearPickToolbarPanelMeta(
  t: TranslateFn,
  onClose: () => void,
): ToolbarPanelMeta {
  return {
    title: t("gearPickPanel.title"),
    closeAriaLabel: t("gearPickPanel.closeAria"),
    onClose,
    maxWidth: TRACKER_UNIT_GRID_PANEL_MAX_WIDTH,
  };
}
