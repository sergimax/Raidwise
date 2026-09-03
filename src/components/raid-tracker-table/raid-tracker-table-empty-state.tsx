import { TableCell, TableRow, Typography } from "@mui/material";
import {
  emptyStateMessage,
  type RaidTrackerTableEmptyVariant,
} from "./raid-tracker-table-empty-state.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  raidTrackerTableColumnCount,
  type PinnedColumnDef,
} from "./table-layout.ts";

type RaidTrackerTableEmptyStateProps = {
  variant: RaidTrackerTableEmptyVariant;
  visiblePinnedColumns: ReadonlyArray<PinnedColumnDef>;
  characterCount: number;
};

export function RaidTrackerTableEmptyState({
  variant,
  visiblePinnedColumns,
  characterCount,
}: RaidTrackerTableEmptyStateProps) {
  const { t } = useTranslation();
  const columnCount = raidTrackerTableColumnCount(
    visiblePinnedColumns,
    characterCount,
    { includeAddCharacterColumn: true },
  );

  return (
    <TableRow>
      <TableCell
        colSpan={columnCount}
        align="center"
        sx={{
          py: 4,
          color: "text.secondary",
          borderBottom: 0,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          role="status"
          aria-live="polite"
        >
          {emptyStateMessage(variant, t)}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
