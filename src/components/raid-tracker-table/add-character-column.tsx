import { Box, TableCell, Typography } from "@mui/material";
import type { KeyboardEvent } from "react";
import { useTranslation } from "../../i18n/use-translation.ts";
import { addPlaceholderControlSx } from "./add-placeholder-cell-sx.ts";
import {
  CHARACTER_BODY_CELL_SX,
  CHARACTER_HEADER_CELL_SX,
} from "./table-layout.ts";

type AddCharacterCellProps = {
  onAddCharacter: () => void;
  active?: boolean;
};

function handleActivateKey(
  event: KeyboardEvent<HTMLElement>,
  onActivate: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
}

export function AddCharacterHeaderCell({
  onAddCharacter,
  active = false,
}: AddCharacterCellProps) {
  const { t } = useTranslation();

  return (
    <TableCell sx={CHARACTER_HEADER_CELL_SX}>
      <Box
        component="button"
        type="button"
        aria-label={t("table.addCharacterAria")}
        aria-pressed={active}
        onClick={onAddCharacter}
        onKeyDown={(event) => handleActivateKey(event, onAddCharacter)}
        sx={addPlaceholderControlSx({ active })}
      >
        <Typography variant="caption" component="span" sx={{ fontWeight: 600 }}>
          {t("table.addCharacterColumn")}
        </Typography>
      </Box>
    </TableCell>
  );
}

export function AddCharacterBodyCell({
  onAddCharacter,
  active = false,
}: AddCharacterCellProps) {
  const { t } = useTranslation();

  return (
    <TableCell sx={CHARACTER_BODY_CELL_SX}>
      <Box
        component="button"
        type="button"
        aria-label={t("table.addCharacterAria")}
        aria-pressed={active}
        onClick={onAddCharacter}
        onKeyDown={(event) => handleActivateKey(event, onAddCharacter)}
        sx={{
          ...addPlaceholderControlSx({ active }),
          minHeight: 36,
        }}
      >
        <Typography variant="caption" component="span" sx={{ fontWeight: 600 }}>
          +
        </Typography>
      </Box>
    </TableCell>
  );
}
