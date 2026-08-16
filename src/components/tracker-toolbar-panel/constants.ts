/**
 * Cap for New raid (2× 300px unit columns + gap + panel padding).
 * Content grid is 612px; padding keeps the outlined card from clipping.
 */
export const TRACKER_DUNGEON_FORM_PANEL_MAX_WIDTH = 680;

/**
 * Cap for New character (1 + 2 + 2 unit columns + gaps + panel padding).
 * Content grid is 1524px; padding keeps the outlined card from clipping.
 */
export const TRACKER_CHARACTER_FORM_PANEL_MAX_WIDTH = 1600;

/**
 * Cap for BiS lists (class/spec | items | lists). Narrower than the unit-grid
 * panels so three columns stay readable on ultrawide viewports.
 */
export const TRACKER_WIDE_PANEL_MAX_WIDTH = 1280;

/**
 * Cap for Character pick / Soft pick. Sized for the shared 300px unit grid:
 * filters + a 2-unit results/softs column + Soft pick copy (1×2), without
 * collapsing the Soft reserve targets block on wide layouts.
 */
export const TRACKER_UNIT_GRID_PANEL_MAX_WIDTH = 1920;

/**
 * Cap for Data controls (2×2 unit blocks + panel padding).
 * Content grid is 612px; padding keeps the outlined card from clipping.
 */
export const TRACKER_DATA_CONTROLS_PANEL_MAX_WIDTH = 680;
