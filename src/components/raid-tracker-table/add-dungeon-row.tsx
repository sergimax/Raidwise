import { Box, Stack, TableCell, TableRow, Typography } from "@mui/material";
import type { KeyboardEvent } from "react";
import { useTranslation } from "../../i18n/use-translation.ts";
import { AddCharacterBodyCell } from "./add-character-column.tsx";
import { addPlaceholderControlSx } from "./add-placeholder-cell-sx.ts";
import {
  pinnedActionsColumnSx,
  type PinnedColumnDef,
} from "./table-layout.ts";

type AddDungeonRowProps = {
  compactTable: boolean;
  visiblePinnedColumns: ReadonlyArray<PinnedColumnDef>;
  characterCount: number;
  onAddDungeon: () => void;
  onAddCharacter?: () => void;
  active?: boolean;
  characterFormActive?: boolean;
  showEmptyHint?: boolean;
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

/**
 * Trailing empty raid row: one dashed control spanning actions + pinned columns,
 * plus optional trailing add-character cell for column alignment.
 */
export function AddDungeonRow({
  compactTable,
  visiblePinnedColumns,
  characterCount,
  onAddDungeon,
  onAddCharacter,
  active = false,
  characterFormActive = false,
  showEmptyHint = false,
}: AddDungeonRowProps) {
  const { t } = useTranslation();
  const pinnedSpan = 1 + visiblePinnedColumns.length;

  return (
    <TableRow>
      <TableCell
        colSpan={pinnedSpan}
        sx={{
          ...pinnedActionsColumnSx(compactTable, false),
          // Unstick so the dashed control can span pinned columns without a hard clip.
          position: "static",
          left: "auto",
          width: "auto",
          minWidth: 0,
          maxWidth: "none",
          boxShadow: "none",
          py: 1,
          borderBottom: 0,
        }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Box
            component="button"
            type="button"
            aria-label={t("table.addRaidAria")}
            aria-pressed={active}
            onClick={onAddDungeon}
            onKeyDown={(event) => handleActivateKey(event, onAddDungeon)}
            sx={{
              ...addPlaceholderControlSx({ active }),
              justifyContent: "flex-start",
              px: 1.25,
              minHeight: 44,
            }}
          >
            <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
              {t("table.addRaidRow")}
            </Typography>
          </Box>
          {showEmptyHint ? (
            <Typography
              variant="caption"
              color="text.secondary"
              role="status"
              aria-live="polite"
              sx={{ px: 0.5 }}
            >
              {t("table.addRaidHint")}
            </Typography>
          ) : null}
        </Stack>
      </TableCell>
      {/* Spacer cells for existing character columns so the add-character cell stays last. */}
      {Array.from({ length: characterCount }, (_, index) => (
        <TableCell
          key={`add-raid-spacer-${index}`}
          sx={{ borderBottom: 0, py: 1 }}
        />
      ))}
      {onAddCharacter ? (
        <AddCharacterBodyCell
          onAddCharacter={onAddCharacter}
          active={characterFormActive}
        />
      ) : null}
    </TableRow>
  );
}
