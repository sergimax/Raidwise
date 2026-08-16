import type { ButtonProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { TranslateFn } from "../../i18n/translate.ts";
import type { TrackerControlsSource } from "./types.ts";

export type { TrackerControlsSource } from "./types.ts";

export type TrackerActionId =
  | "addFromTemplate"
  | "addCharacter"
  | "addDungeon"
  | "bisLists"
  | "exportStatus"
  | "gearPick"
  | "dataControls";

export type TrackerAction = {
  id: TrackerActionId;
  label: string;
  onClick: () => void;
  visible?: boolean;
  disabled?: boolean;
  selected?: boolean;
  buttonVariant?: ButtonProps["variant"];
  buttonColor?: ButtonProps["color"];
  ariaExpanded?: boolean;
  menuItemSx?: SxProps<Theme>;
};

export function buildTrackerActions(
  source: TrackerControlsSource,
  t: TranslateFn,
): TrackerAction[] {
  const showAddFromTemplate = source.dungeonsCount === 0;

  return [
    {
      id: "addFromTemplate",
      label: t("toolbar.addFromTemplate"),
      onClick: source.handleAddFromTemplate,
      visible: showAddFromTemplate,
      buttonVariant: "contained",
      buttonColor: "secondary",
    },
    {
      id: "exportStatus",
      label: t("toolbar.export"),
      onClick: source.toggleCharacterPickPanel,
      selected: source.showCharacterPickPanel,
      buttonVariant: source.showCharacterPickPanel ? "contained" : "outlined",
      buttonColor: "inherit",
      ariaExpanded: source.showCharacterPickPanel,
      disabled: source.charactersCount === 0 || source.dungeonsCount === 0,
    },
    {
      id: "gearPick",
      label: t("toolbar.gearPick"),
      onClick: source.toggleGearPickPanel,
      selected: source.showGearPickPanel,
      buttonVariant: source.showGearPickPanel ? "contained" : "outlined",
      buttonColor: "inherit",
      ariaExpanded: source.showGearPickPanel,
      disabled: source.charactersCount === 0 || source.dungeonsCount === 0,
    },
    {
      id: "bisLists",
      label: t("toolbar.bisLists"),
      onClick: source.toggleBisListsPanel,
      selected: source.showBisListsPanel,
      buttonVariant: source.showBisListsPanel ? "contained" : "outlined",
      buttonColor: "inherit",
      ariaExpanded: source.showBisListsPanel,
    },
    {
      id: "addCharacter",
      label: t("toolbar.addCharacter"),
      onClick: source.toggleCharacterForm,
      selected: source.showCharacterForm,
      buttonVariant: source.showCharacterForm ? "contained" : "outlined",
      buttonColor: "inherit",
      ariaExpanded: source.showCharacterForm,
    },
    {
      id: "addDungeon",
      label: t("toolbar.addDungeon"),
      onClick: source.toggleDungeonForm,
      selected: source.showDungeonForm,
      buttonVariant: source.showDungeonForm ? "contained" : "outlined",
      buttonColor: "inherit",
      ariaExpanded: source.showDungeonForm,
    },
    {
      id: "dataControls",
      label: t("toolbar.dataControls"),
      onClick: source.toggleDataControlsPanel,
      selected: source.showDataControlsPanel,
      buttonVariant: source.showDataControlsPanel ? "contained" : "outlined",
      buttonColor: "inherit",
      ariaExpanded: source.showDataControlsPanel,
    },
  ];
}
