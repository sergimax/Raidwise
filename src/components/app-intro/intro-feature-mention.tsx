import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";

type IntroFeatureMentionProps = {
  label: string;
  /** Matches toolbar CTA styling for Add raids from template. */
  emphasis?: "default" | "secondary";
};

/** Compact inline chip that echoes a toolbar / feature control label. */
export function IntroFeatureMention({
  label,
  emphasis = "default",
}: IntroFeatureMentionProps) {
  return (
    <Box
      component="span"
      sx={(theme) => {
        const isSecondary = emphasis === "secondary";
        return {
          display: "inline-flex",
          alignItems: "center",
          verticalAlign: "baseline",
          maxWidth: "100%",
          px: 0.75,
          py: 0.1,
          mx: 0.15,
          borderRadius: "8px",
          border: 1,
          borderColor: isSecondary ? "secondary.main" : "divider",
          bgcolor: isSecondary
            ? alpha(theme.palette.secondary.main, theme.palette.mode === "light" ? 0.14 : 0.22)
            : alpha(
                theme.palette.background.paper,
                theme.palette.mode === "light" ? 0.9 : 0.55,
              ),
          color: "text.primary",
          fontWeight: 600,
          fontSize: "0.8125rem",
          lineHeight: 1.4,
          whiteSpace: "nowrap",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 1px 1px rgba(15, 23, 42, 0.04)"
              : "0 1px 1px rgba(0, 0, 0, 0.25)",
        };
      }}
    >
      {label}
    </Box>
  );
}
