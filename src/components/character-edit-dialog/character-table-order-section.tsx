import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import type { CharacterRecord } from "../../types/characters.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import { getCharacterOrderNeighbors } from "../../utils/move-character.ts";

type CharacterTableOrderControlProps = {
  character: CharacterRecord;
  characters: CharacterRecord[];
  onMove: (direction: -1 | 1) => void;
  t: TranslateFn;
};

/** Compact header control: `Position: < n >` */
export function CharacterTableOrderControl({
  character,
  characters,
  onMove,
  t,
}: CharacterTableOrderControlProps) {
  if (characters.length < 2) {
    return null;
  }

  const { index, canMoveLeft, canMoveRight } = getCharacterOrderNeighbors(
    characters,
    character.id,
  );
  if (index < 0) {
    return null;
  }

  const currentPosition = index + 1;
  const positionTooltip = t("characterEdit.orderPosition", {
    position: currentPosition,
    total: characters.length,
  });

  return (
    <Tooltip title={positionTooltip} enterDelay={400}>
      <Box
        component="span"
        role="group"
        aria-label={positionTooltip}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          // Full-width row under the title on narrow screens; right-aligned on wider.
          flexBasis: { xs: "100%", sm: "auto" },
          ml: { xs: 0, sm: "auto" },
          justifyContent: { xs: "flex-start", sm: "flex-end" },
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <Typography
          component="span"
          variant="body2"
          color="text.secondary"
          sx={{ mr: 0.5, lineHeight: 1.2, whiteSpace: "nowrap" }}
        >
          {t("characterEdit.orderLabel")}
        </Typography>
        <IconButton
          size="small"
          aria-label={t("characterEdit.orderMoveLeft")}
          disabled={!canMoveLeft}
          onClick={() => onMove(-1)}
          sx={{ p: 0.25 }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography
          component="span"
          variant="body2"
          sx={{
            lineHeight: 1.2,
            fontWeight: 700,
            whiteSpace: "nowrap",
            minWidth: "1.5ch",
            textAlign: "center",
          }}
        >
          {currentPosition}
        </Typography>
        <IconButton
          size="small"
          aria-label={t("characterEdit.orderMoveRight")}
          disabled={!canMoveRight}
          onClick={() => onMove(1)}
          sx={{ p: 0.25 }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    </Tooltip>
  );
}
