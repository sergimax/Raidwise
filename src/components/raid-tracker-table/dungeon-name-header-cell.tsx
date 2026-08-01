import type { SxProps, Theme } from "@mui/material";
import { Stack, TableCell, TableSortLabel } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { DungeonSortKey, SortDirection } from "../../utils/sort-dungeons.ts";
import { DungeonNameSearchField } from "../dungeon-name-search-field/index.tsx";

type DungeonNameHeaderCellProps = {
  activeSortKey: DungeonSortKey;
  sortDirection: SortDirection;
  onSort: (sortKey: DungeonSortKey) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  sx?: SxProps<Theme>;
};

export function DungeonNameHeaderCell({
  activeSortKey,
  sortDirection,
  onSort,
  searchQuery,
  onSearchQueryChange,
  sx,
}: DungeonNameHeaderCellProps) {
  const { t } = useTranslation();
  const isActive = activeSortKey === "name";

  return (
    <TableCell
      sortDirection={isActive ? sortDirection : false}
      sx={sx}
      className="raid-tracker-table__dungeon-name-header"
    >
      <Stack spacing={0.5}>
        <TableSortLabel
          active={isActive}
          direction={isActive ? sortDirection : "asc"}
          onClick={() => {
            onSort("name");
          }}
        >
          {t("table.dungeonName")}
        </TableSortLabel>
        <DungeonNameSearchField
          value={searchQuery}
          onChange={onSearchQueryChange}
        />
      </Stack>
    </TableCell>
  );
}
