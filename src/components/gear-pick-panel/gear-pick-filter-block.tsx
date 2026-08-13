import { Box } from "@mui/material";
import type { ReactNode } from "react";
import {
  getGearPickCopyBlockMaxHeight,
  getGearPickCopyBlockMaxWidth,
  getGearPickSoftsBlockMaxWidth,
  type GearPickGridAreaId,
} from "./constants.ts";

type GearPickFilterBlockProps = {
  gridArea: GearPickGridAreaId;
  children: ReactNode;
  /** Cap the soft-reserve call block at its configured filter-unit span. */
  copyBlockSized?: boolean;
};

/** Positions a Soft pick panel region in the responsive grid. */
export function GearPickFilterBlock({
  gridArea,
  children,
  copyBlockSized = false,
}: GearPickFilterBlockProps) {
  return (
    <Box
      sx={{
        gridArea: { xs: "auto", md: gridArea },
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        height: { xs: "auto", md: "100%" },
        maxHeight: copyBlockSized
          ? {
              xs: getGearPickCopyBlockMaxHeight(),
              md: getGearPickCopyBlockMaxHeight(),
            }
          : undefined,
        maxWidth: copyBlockSized
          ? {
              xs: "100%",
              md: getGearPickCopyBlockMaxWidth(),
            }
          : gridArea === "softs"
            ? {
                xs: "100%",
                md: getGearPickSoftsBlockMaxWidth(),
              }
            : { xs: "100%", md: "none" },
        overflow: { xs: "visible", md: "hidden" },
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
