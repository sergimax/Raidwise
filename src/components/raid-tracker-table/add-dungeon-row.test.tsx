import { Table, TableBody } from "@mui/material";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithTheme, screen } from "../../test/render-with-theme.tsx";
import { AddDungeonRow } from "./add-dungeon-row.tsx";
import { PINNED_COLUMNS } from "./table-layout.ts";

describe("AddDungeonRow", () => {
  it("renders an accessible add-raid control", () => {
    renderWithTheme(
      <Table>
        <TableBody>
          <AddDungeonRow
            compactTable={false}
            visiblePinnedColumns={PINNED_COLUMNS}
            characterCount={2}
            onAddDungeon={() => {}}
            active={false}
            showEmptyHint={false}
          />
        </TableBody>
      </Table>,
    );

    expect(
      screen.getByRole("button", { name: /add raid/i }),
    ).toBeInTheDocument();
  });

  it("calls onAddDungeon when the control is clicked", () => {
    const onAddDungeon = vi.fn();
    renderWithTheme(
      <Table>
        <TableBody>
          <AddDungeonRow
            compactTable={false}
            visiblePinnedColumns={PINNED_COLUMNS}
            characterCount={0}
            onAddDungeon={onAddDungeon}
            active={false}
            showEmptyHint={false}
          />
        </TableBody>
      </Table>,
    );

    fireEvent.click(screen.getByRole("button", { name: /add raid/i }));
    expect(onAddDungeon).toHaveBeenCalledTimes(1);
  });

  it("shows template hint when the dungeon list is empty", () => {
    renderWithTheme(
      <Table>
        <TableBody>
          <AddDungeonRow
            compactTable={false}
            visiblePinnedColumns={PINNED_COLUMNS}
            characterCount={0}
            onAddDungeon={() => {}}
            active={false}
            showEmptyHint
          />
        </TableBody>
      </Table>,
    );

    expect(
      screen.getByText(/add raids from template/i),
    ).toBeInTheDocument();
  });

  it("includes trailing add-character cell when onAddCharacter is provided", () => {
    const onAddCharacter = vi.fn();
    renderWithTheme(
      <Table>
        <TableBody>
          <AddDungeonRow
            compactTable={false}
            visiblePinnedColumns={PINNED_COLUMNS}
            characterCount={1}
            onAddDungeon={() => {}}
            onAddCharacter={onAddCharacter}
            active={false}
            characterFormActive={false}
            showEmptyHint={false}
          />
        </TableBody>
      </Table>,
    );

    fireEvent.click(screen.getByRole("button", { name: /add character/i }));
    expect(onAddCharacter).toHaveBeenCalledTimes(1);
  });
});
