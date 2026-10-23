import { alpha, type Theme } from "@mui/material/styles";
import type { RaidKey } from "../../data/raid-names.ts";

const RAID_ROW_BACKGROUND_FILES: Partial<Record<RaidKey, string>> = {
  naxxramas: "Naxx-loading.png",
  obsidianSanctum: "OS-loading.png",
  onyxiasLair: "OL-loading.png",
  vaultOfArchavon: "VoA-loading.png",
  trialOfTheCrusader: "TotC-loading.png",
  ulduar: "Ulduar-loading.png",
  icecrownCitadel: "ICC-loading.png",
  rubySanctum: "RS-loading.png",
};

export function raidRowBackgroundFile(raidKey?: RaidKey): string | undefined {
  return raidKey ? RAID_ROW_BACKGROUND_FILES[raidKey] : undefined;
}

export function raidRowBackgroundSx(theme: Theme, file: string) {
  const paper = theme.palette.background.paper;
  const overlay =
    theme.palette.mode === "dark"
      ? `linear-gradient(90deg, ${alpha(paper, 0.25)} 0%, ${alpha(paper, 0.7)} 72%, ${paper} 100%)`
      : `linear-gradient(90deg, ${alpha(paper, 0.35)} 0%, ${alpha(paper, 0.78)} 72%, ${paper} 100%)`;

  return {
    backgroundImage: `${overlay}, url("${import.meta.env.BASE_URL}images/raids/${file}")`,
    backgroundSize: "100% 100%, cover",
    backgroundPosition: "center, center",
    backgroundRepeat: "no-repeat",
  };
}
