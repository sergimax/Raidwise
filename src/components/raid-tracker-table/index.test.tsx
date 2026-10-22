import { beforeEach, describe, expect, it, vi } from "vitest";
import { RaidTrackerProvider } from "../../contexts/raid-tracker-provider.tsx";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import { saveRaidTrackerState } from "../../storage/index.ts";
import {
  createTestCharacter,
  createTestDungeon,
} from "../../test/fixtures.ts";
import {
  fireEvent,
  renderWithTheme,
  screen,
  waitFor,
  within,
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

function PopulatedTableHarness() {
  const domain = useRaidTrackerContext();
  const tableState = useRaidTrackerTableState({
    characters: domain.characters,
    dungeons: domain.dungeons,
    dungeonToggles: domain.dungeonToggles,
    onDeleteCharacter: domain.handleDeleteCharacter,
    onDeleteDungeon: domain.handleDeleteDungeon,
  });
  return (
    <RaidTrackerTable
      tableState={tableState}
      onAddCharacter={() => {}}
      onAddDungeon={() => {}}
    />
  );
}

function renderPopulatedTable() {
  return renderWithTheme(
    <RaidTrackerProvider>
      <PopulatedTableHarness />
    </RaidTrackerProvider>,
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

describe("RaidTrackerTable with saved data", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sorts and filters populated dungeon rows", () => {
    saveRaidTrackerState({
      characters: [],
      dungeons: [
        createTestDungeon({ id: "zeta", name: "Zeta", itemLevel: [200] }),
        createTestDungeon({ id: "alpha", name: "Alpha", itemLevel: [250] }),
      ],
      dungeonToggles: {},
    });
    renderPopulatedTable();

    const dungeonActions = () =>
      within(screen.getByRole("table"))
        .getAllByRole("button", { name: /delete dungeon:/i })
        .map((button) => button.getAttribute("aria-label"));
    expect(dungeonActions()).toEqual([
      "Delete dungeon: Alpha",
      "Delete dungeon: Zeta",
    ]);

    fireEvent.click(screen.getByText("Dungeon name"));
    expect(dungeonActions()).toEqual([
      "Delete dungeon: Alpha",
      "Delete dungeon: Zeta",
    ]);
    fireEvent.click(screen.getByText("Dungeon name"));
    expect(dungeonActions()).toEqual([
      "Delete dungeon: Zeta",
      "Delete dungeon: Alpha",
    ]);

    fireEvent.change(screen.getByRole("textbox", { name: /filter by raid name/i }), {
      target: { value: "Zeta" },
    });
    expect(dungeonActions()).toEqual(["Delete dungeon: Zeta"]);
  });

  it("toggles a cooldown and confirms or cancels deletion", async () => {
    const character = createTestCharacter({ id: "alpha", name: "Alpha" });
    const dungeon = createTestDungeon({ id: "citadel", name: "Citadel" });
    saveRaidTrackerState({
      characters: [character],
      dungeons: [dungeon],
      dungeonToggles: {},
    });
    renderPopulatedTable();

    const toggle = screen.getByRole("switch", { name: "Alpha — Citadel" });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Delete dungeon: Citadel" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Delete dungeon?");
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Delete dungeon: Citadel" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete dungeon: Citadel" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Delete dungeon: Citadel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: "Alpha — Citadel" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove character Alpha" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Remove character Alpha" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove character Alpha" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Remove character Alpha" })).not.toBeInTheDocument();
  });
});
