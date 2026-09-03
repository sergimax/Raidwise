import { describe, expect, it, vi } from "vitest";
import { RaidTrackerProvider } from "../../contexts/raid-tracker-provider.tsx";
import {
  fireEvent,
  renderWithTheme,
  screen,
} from "../../test/render-with-theme.tsx";
import { useRaidTrackerTableState } from "./use-raid-tracker-table-state.ts";
import { RaidTrackerTable } from "./index.tsx";

function TableHarness({
  onAddCharacter = () => {},
  onAddDungeon = () => {},
}: {
  onAddCharacter?: () => void;
  onAddDungeon?: () => void;
}) {
  const tableState = useRaidTrackerTableState({
    characters: [],
    dungeons: [],
    dungeonToggles: {},
    onDeleteCharacter: () => {},
    onDeleteDungeon: () => {},
  });

  return (
    <RaidTrackerTable
      tableState={tableState}
      onAddCharacter={onAddCharacter}
      onAddDungeon={onAddDungeon}
    />
  );
}

describe("RaidTrackerTable add placeholders", () => {
  it("shows add-raid control and template hint when there are no dungeons", () => {
    renderWithTheme(
      <RaidTrackerProvider>
        <TableHarness />
      </RaidTrackerProvider>,
    );

    expect(
      screen.getByRole("button", { name: /add raid/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/add raids from template/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /add character/i }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("opens add flows from the empty placeholders", () => {
    const onAddCharacter = vi.fn();
    const onAddDungeon = vi.fn();

    renderWithTheme(
      <RaidTrackerProvider>
        <TableHarness
          onAddCharacter={onAddCharacter}
          onAddDungeon={onAddDungeon}
        />
      </RaidTrackerProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /add raid/i }));
    fireEvent.click(screen.getAllByRole("button", { name: /add character/i })[0]!);

    expect(onAddDungeon).toHaveBeenCalledTimes(1);
    expect(onAddCharacter).toHaveBeenCalledTimes(1);
  });
});
