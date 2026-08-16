import { useMediaQuery } from "@mui/material";
import { CHARACTER_PICK_SIDE_BY_SIDE_MQ } from "./constants.ts";

export function useCharacterPickPanelSideBySide(): boolean {
  return useMediaQuery(CHARACTER_PICK_SIDE_BY_SIDE_MQ);
}
