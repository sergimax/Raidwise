import { Typography } from "@mui/material";
import { formatCharacterDisplayName } from "../../utils/character-display.ts";

type CharacterSpecListNameProps = {
  name: string;
  inactive?: boolean;
  /** Cooldown = italic/disabled; filters = muted (Character pick only). */
  inactiveTone?: "cooldown" | "filters";
};

/** Truncating name cell shared by Character pick and Soft pick spec lists. */
export function CharacterSpecListName({
  name,
  inactive = false,
  inactiveTone = "cooldown",
}: CharacterSpecListNameProps) {
  const displayName = formatCharacterDisplayName(name);
  const color =
    !inactive
      ? "text.primary"
      : inactiveTone === "filters"
        ? "text.secondary"
        : "text.disabled";

  return (
    <Typography
      variant="body2"
      title={displayName}
      sx={{
        fontWeight: inactive ? 500 : 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        minWidth: 0,
        color,
        fontStyle: inactive && inactiveTone === "cooldown" ? "italic" : "normal",
      }}
    >
      {displayName}
    </Typography>
  );
}
