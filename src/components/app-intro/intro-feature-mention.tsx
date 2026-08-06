import { Box } from "@mui/material";

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
  const isBrand = emphasis === "secondary";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        verticalAlign: "baseline",
        maxWidth: "100%",
        px: 0.75,
        py: 0.1,
        mx: 0.15,
        borderRadius: "8px",
        border: 1,
        borderColor: isBrand
          ? "color-mix(in srgb, var(--brand) 55%, transparent)"
          : "divider",
        bgcolor: isBrand ? "var(--brand-soft)" : "var(--chip-bg)",
        color: isBrand ? "var(--brand)" : "text.primary",
        fontWeight: 600,
        fontSize: "0.8125rem",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
}
