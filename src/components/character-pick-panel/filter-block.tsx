import { Box } from "@mui/material";
import type { ReactNode } from "react";
import type { CharacterPickFilterGridAreaId } from "./constants.ts";

type CharacterPickFilterBlockProps = {
  gridArea: CharacterPickFilterGridAreaId;
  children: ReactNode;
};

export function CharacterPickFilterBlock({ gridArea, children }: CharacterPickFilterBlockProps) {
  return (
    <Box
      sx={{
        gridArea: { xs: "auto", md: gridArea },
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        height: { xs: "auto", md: "100%" },
        overflow: { xs: "visible", md: "hidden" },
        maxWidth: { xs: "100%", md: "none" },
        "& > *": {
          flex: 1,
          minHeight: 0,
          width: "100%",
        },
      }}
    >
      {children}
    </Box>
  );
}
