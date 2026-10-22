import { beforeEach, describe, expect, it } from "vitest";
import { RaidTrackerProvider } from "../../contexts/raid-tracker-provider.tsx";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import { saveLocalBisListsState } from "../../storage/bis-lists/index.ts";
import { BIS_LISTS_SCHEMA_VERSION } from "../../storage/bis-lists/constants.ts";
import { saveRaidTrackerState } from "../../storage/index.ts";
import {
  createTestCharacter,
  createTestDungeon,
  createTestToggles,
} from "../../test/fixtures.ts";
import {
  fireEvent,
  renderWithTheme,
  screen,
  waitFor,
  within,
} from "../../test/render-with-theme.tsx";
import { ClassName } from "../../types/characters.ts";
import type { DungeonToggles } from "../../types/dungeons.ts";
import { specBisStorageKey } from "../../utils/bis-lists.ts";
import { DataControlsPanel } from "./index.tsx";

type Snapshot = {
  characterIds: string[];
  dungeonIds: string[];
  dungeonToggles: DungeonToggles;
  hasLocalBisPresets: boolean;
};

function DataControlsHarness() {
  const domain = useRaidTrackerContext();
  const bisLists = useBisListsContext();
  const snapshot: Snapshot = {
    characterIds: domain.characters.map((character) => character.id),
    dungeonIds: domain.dungeons.map((dungeon) => dungeon.id),
    dungeonToggles: domain.dungeonToggles,
    hasLocalBisPresets: bisLists.hasAnyLocalBisPresets,
  };

  return (
    <>
      <DataControlsPanel onAddFromTemplate={() => {}} />
      <output data-testid="domain-snapshot">{JSON.stringify(snapshot)}</output>
    </>
  );
}

function readSnapshot(): Snapshot {
  return JSON.parse(screen.getByTestId("domain-snapshot").textContent ?? "") as Snapshot;
}

const initialSnapshot: Snapshot = {
  characterIds: ["alpha"],
  dungeonIds: ["citadel"],
  dungeonToggles: { alpha: { citadel: true } },
  hasLocalBisPresets: true,
};

describe("DataControlsPanel confirmations", () => {
  beforeEach(() => {
    localStorage.clear();
    saveRaidTrackerState({
      characters: [createTestCharacter({ id: "alpha", name: "Alpha" })],
      dungeons: [createTestDungeon({ id: "citadel", name: "Citadel" })],
      dungeonToggles: createTestToggles([
        { characterId: "alpha", dungeonId: "citadel" },
      ]),
    });
    saveLocalBisListsState({
      schemaVersion: BIS_LISTS_SCHEMA_VERSION,
      entries: {
        [specBisStorageKey(ClassName.DeathKnight, "Unholy")]: {
          selectedPresetId: "local-test",
          presets: [
            {
              id: "local-test",
              name: "My list",
              slots: [{ slot: 0, itemIds: [51312] }],
            },
          ],
        },
      },
    });
  });

  it.each([
    {
      action: "Reset all toggles",
      confirm: "Reset",
      expected: { ...initialSnapshot, dungeonToggles: {} },
    },
    {
      action: "Delete all characters",
      confirm: "Delete",
      expected: { ...initialSnapshot, characterIds: [], dungeonToggles: {} },
    },
    {
      action: "Delete all dungeons",
      confirm: "Delete",
      expected: { ...initialSnapshot, dungeonIds: [], dungeonToggles: {} },
    },
    {
      action: "Delete all custom lists",
      confirm: "Delete",
      expected: { ...initialSnapshot, hasLocalBisPresets: false },
    },
  ])("cancels or confirms $action without affecting other data", async ({
    action,
    confirm,
    expected,
  }) => {
    renderWithTheme(
      <RaidTrackerProvider>
        <DataControlsHarness />
      </RaidTrackerProvider>,
    );
    expect(readSnapshot()).toEqual(initialSnapshot);

    fireEvent.click(screen.getByRole("button", { name: action }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(readSnapshot()).toEqual(initialSnapshot);

    fireEvent.click(screen.getByRole("button", { name: action }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: confirm }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(readSnapshot()).toEqual(expected);
  });
});
