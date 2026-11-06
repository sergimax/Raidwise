import { Box, Switch } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type GearCounts = { bis: number; ilvl: number };

function GearItemCounts({ counts, side }: {
  counts: GearCounts;
  side: "left" | "right";
}) {
  const { t } = useTranslation();
  const visibleCounts = [
    { kind: "bis" as const, count: counts.bis },
    { kind: "ilvl" as const, count: counts.ilvl },
  ].filter(({ count }) => count > 0);

  return (
    <Box component="span" sx={{
      position: "absolute",
      insetBlock: 0,
      left: side === "left" ? 0 : "50%",
      width: "50%",
      display: "grid",
      gridTemplateRows: "repeat(2, 1fr)",
      pointerEvents: "none",
    }}>
      {visibleCounts.map(({ kind, count }) => (
        <Box
          component="span"
          key={kind}
          aria-label={`${t(kind === "bis" ? "gearHint.kindLabelBis" : "gearHint.kindLabelUpgrades")}: ${count}`}
          sx={{
            gridRow: kind === "bis" ? 1 : 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            opacity: 0.7,
            fontSize: 13,
            lineHeight: 1.2,
            fontWeight: 400,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          х{count}
        </Box>
      ))}
    </Box>
  );
}

export function RaidToggleContent({
  checked,
  onChange,
  label,
  main,
  off,
}: {
  checked: boolean;
  onChange?: () => void;
  label?: string;
  main?: GearCounts;
  off?: GearCounts;
}) {
  return (
    <Box component="span" sx={{
      position: "relative",
      minHeight: 36,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    }}>
      {!checked && main && <GearItemCounts side="left" counts={main} />}
      <Switch
        size="small"
        checked={checked}
        onChange={onChange}
        slotProps={{
          input: {
            "aria-label": label,
            readOnly: !onChange,
            tabIndex: onChange ? undefined : -1,
          },
        }}
        sx={onChange ? undefined : { pointerEvents: "none" }}
      />
      {!checked && off && <GearItemCounts side="right" counts={off} />}
    </Box>
  );
}
