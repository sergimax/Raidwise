import { Button, MenuItem } from "@mui/material";
import type { TrackerAction } from "./actions.ts";

export type TrackerActionLayout = "button" | "menuItem";

type RenderTrackerActionOptions = {
  onAfterClick?: () => void;
};

export function renderTrackerAction(
  action: TrackerAction,
  layout: TrackerActionLayout,
  options?: RenderTrackerActionOptions,
) {
  if (action.visible === false) {
    return null;
  }

  const handleClick = () => {
    action.onClick();
    options?.onAfterClick?.();
  };

  if (layout === "menuItem") {
    return (
      <MenuItem
        key={action.id}
        selected={action.selected}
        disabled={action.disabled}
        onClick={handleClick}
        sx={action.menuItemSx}
      >
        {action.label}
      </MenuItem>
    );
  }

  return (
    <Button
      key={action.id}
      size="small"
      variant={action.buttonVariant ?? "outlined"}
      color={action.buttonColor ?? "inherit"}
      disabled={action.disabled}
      aria-expanded={action.ariaExpanded}
      aria-pressed={action.selected}
      onClick={handleClick}
    >
      {action.label}
    </Button>
  );
}
