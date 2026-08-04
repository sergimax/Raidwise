import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { superThemeTokens } from "../../theme/create-app-theme.ts";

type IntroFeatureMentionProps = {
  label: string;
  /** Matches toolbar CTA styling for Add raids from template (brand chip). */
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
        const isBrand = emphasis === "secondary";
        const tokens = superThemeTokens[theme.palette.mode];
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
          borderColor: isBrand ? tokens.brandBorder : "divider",
          bgcolor: isBrand
            ? tokens.brandSoft
            : alpha(
                theme.palette.background.paper,
                theme.palette.mode === "light" ? 0.9 : 0.55,
              ),
          color: isBrand ? tokens.brand : "text.primary",
          fontWeight: 600,
          fontSize: "0.8125rem",
          lineHeight: 1.4,
          whiteSpace: "nowrap",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 1px 1px rgba(0, 0, 0, 0.04)"
              : "0 1px 1px rgba(0, 0, 0, 0.25)",
        };
      }}
    >
      {label}
    </Box>
  );
}
