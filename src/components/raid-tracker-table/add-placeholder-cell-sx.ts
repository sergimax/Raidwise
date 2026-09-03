/**
 * Shared dotted “add” control look for trailing character column / raid row.
 */

export const ADD_PLACEHOLDER_BORDER =
  "1px dashed color-mix(in srgb, var(--border) 70%, transparent)";

export const ADD_PLACEHOLDER_BORDER_HOVER =
  "1px dashed color-mix(in srgb, var(--border) 100%, transparent)";

export const ADD_PLACEHOLDER_BORDER_ACTIVE =
  "1px dashed color-mix(in srgb, var(--brand) 55%, var(--border))";

type AddPlaceholderControlSxOptions = {
  active?: boolean;
};

/** Inner button / control surface for empty add cells. */
export function addPlaceholderControlSx({
  active = false,
}: AddPlaceholderControlSxOptions = {}) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 40,
    px: 0.75,
    py: 0.5,
    boxSizing: "border-box" as const,
    border: active ? ADD_PLACEHOLDER_BORDER_ACTIVE : ADD_PLACEHOLDER_BORDER,
    borderRadius: 1,
    cursor: "pointer",
    color: "text.secondary",
    bgcolor: active
      ? "color-mix(in srgb, var(--brand) 12%, transparent)"
      : "transparent",
    font: "inherit",
    textAlign: "center" as const,
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    transition: "border-color 120ms ease, background-color 120ms ease",
    "&:hover": {
      border: active ? ADD_PLACEHOLDER_BORDER_ACTIVE : ADD_PLACEHOLDER_BORDER_HOVER,
      bgcolor: active
        ? "color-mix(in srgb, var(--brand) 18%, transparent)"
        : "action.hover",
    },
    "&:focus-visible": {
      outline: "2px solid color-mix(in srgb, var(--brand) 70%, transparent)",
      outlineOffset: 2,
    },
  };
}
