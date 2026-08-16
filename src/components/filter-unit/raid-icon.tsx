import { Box } from "@mui/material";
import { getRaidIcon } from "../../assets/raid-icons/raid-icons.ts";
import type { RaidKey } from "../../data/raid-names.ts";

type RaidIconProps = {
  raidKey: RaidKey | undefined;
  size?: number;
};

export function RaidIcon({ raidKey, size = 18 }: RaidIconProps) {
  const iconSrc = getRaidIcon(raidKey);
  if (!iconSrc) {
    return null;
  }

  return (
    <Box
      component="img"
      src={iconSrc}
      alt=""
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "block",
        borderRadius: "4px",
        objectFit: "contain",
      }}
    />
  );
}
