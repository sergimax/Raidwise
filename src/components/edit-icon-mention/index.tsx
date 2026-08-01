import EditIcon from "@mui/icons-material/Edit";
import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";

type EditIconMentionProps = {
  ariaLabel: string;
};

/** Compact inline chip that echoes the character-column edit (pen) control. */
export function EditIconMention({ ariaLabel }: EditIconMentionProps) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "text-bottom",
        width: 22,
        height: 22,
        mx: 0.25,
        borderRadius: "6px",
        border: 1,
        borderColor: "divider",
        bgcolor: alpha(
          theme.palette.background.paper,
          theme.palette.mode === "light" ? 0.9 : 0.55,
        ),
        color: "text.primary",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 1px 1px rgba(15, 23, 42, 0.04)"
            : "0 1px 1px rgba(0, 0, 0, 0.25)",
      })}
      aria-label={ariaLabel}
    >
      <EditIcon sx={{ fontSize: 14 }} />
    </Box>
  );
}
