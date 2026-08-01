import { Table, TableBody } from "@mui/material";
import { describe, expect, it } from "vitest";
import { renderWithTheme, screen } from "../../test/render-with-theme.tsx";
import { RaidTrackerTableEmptyState } from "./raid-tracker-table-empty-state.tsx";
import { PINNED_COLUMNS } from "./table-layout.ts";

describe("RaidTrackerTableEmptyState", () => {
  it("shows add-dungeon hint when there are no dungeons", () => {
    renderWithTheme(
      <Table>
        <TableBody>
          <RaidTrackerTableEmptyState
            variant="no-dungeons"
            visiblePinnedColumns={PINNED_COLUMNS}
            characterCount={0}
          />
        </TableBody>
      </Table>,
    );

    expect(
      screen.getByText(
        "Add a dungeon or use Add raids from template to get started.",
      ),
    ).toBeInTheDocument();
  });

  it("shows no-search-matches hint when filter has no results", () => {
    renderWithTheme(
      <Table>
        <TableBody>
          <RaidTrackerTableEmptyState
            variant="no-search-matches"
            visiblePinnedColumns={PINNED_COLUMNS}
            characterCount={2}
          />
        </TableBody>
      </Table>,
    );

    expect(screen.getByText("No dungeons match your search.")).toBeInTheDocument();
  });
});
