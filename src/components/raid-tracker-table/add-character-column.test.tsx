import { Table, TableBody, TableHead, TableRow } from "@mui/material";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithTheme, screen } from "../../test/render-with-theme.tsx";
import {
  AddCharacterBodyCell,
  AddCharacterHeaderCell,
} from "./add-character-column.tsx";

describe("AddCharacterHeaderCell", () => {
  it("renders an accessible add-character control", () => {
    renderWithTheme(
      <Table>
        <TableHead>
          <TableRow>
            <AddCharacterHeaderCell onAddCharacter={() => {}} active={false} />
          </TableRow>
        </TableHead>
      </Table>,
    );

    expect(
      screen.getByRole("button", { name: /add character/i }),
    ).toBeInTheDocument();
  });

  it("calls onAddCharacter when clicked", () => {
    const onAddCharacter = vi.fn();
    renderWithTheme(
      <Table>
        <TableHead>
          <TableRow>
            <AddCharacterHeaderCell
              onAddCharacter={onAddCharacter}
              active={false}
            />
          </TableRow>
        </TableHead>
      </Table>,
    );

    fireEvent.click(screen.getByRole("button", { name: /add character/i }));
    expect(onAddCharacter).toHaveBeenCalledTimes(1);
  });

  it("calls onAddCharacter on Enter", () => {
    const onAddCharacter = vi.fn();
    renderWithTheme(
      <Table>
        <TableHead>
          <TableRow>
            <AddCharacterHeaderCell
              onAddCharacter={onAddCharacter}
              active={false}
            />
          </TableRow>
        </TableHead>
      </Table>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: /add character/i }), {
      key: "Enter",
    });
    expect(onAddCharacter).toHaveBeenCalledTimes(1);
  });
});

describe("AddCharacterBodyCell", () => {
  it("renders a dashed add control that opens add character", () => {
    const onAddCharacter = vi.fn();
    renderWithTheme(
      <Table>
        <TableBody>
          <TableRow>
            <AddCharacterBodyCell
              onAddCharacter={onAddCharacter}
              active={false}
            />
          </TableRow>
        </TableBody>
      </Table>,
    );

    fireEvent.click(screen.getByRole("button", { name: /add character/i }));
    expect(onAddCharacter).toHaveBeenCalledTimes(1);
  });
});
