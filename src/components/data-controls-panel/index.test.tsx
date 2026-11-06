import { beforeEach, describe, expect, it, vi } from "vitest";
import { RaidTrackerProvider } from "../../contexts/raid-tracker-provider.tsx";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import { saveLocalBisListsState } from "../../storage/bis-lists/index.ts";
import { BIS_LISTS_SCHEMA_VERSION } from "../../storage/bis-lists/constants.ts";
import { loadRaidTrackerState, saveRaidTrackerState } from "../../storage/index.ts";
import { createWorkspaceBackup, MAX_BACKUP_BYTES } from "../../storage/workspace-backup.ts";
import { WORKSPACE_SAVE_KEY, writeWorkspaceSave } from "../../storage/workspace-save.ts";
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

const emptySave = {
  tracker: '{"schemaVersion":7,"characters":[],"dungeons":[],"dungeonToggles":{}}',
  bisLists: '{"schemaVersion":1,"entries":{}}',
};

function selectBackup(file: File) {
  fireEvent.change(document.querySelector('input[type="file"]')!, { target: { files: [file] } });
}

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

  it("previews the file and leaves both saves unchanged on cancel", async () => {
    renderWithTheme(<RaidTrackerProvider><DataControlsHarness /></RaidTrackerProvider>);
    selectBackup(new File([createWorkspaceBackup(emptySave)], "empty-backup.json"));

    const dialog = await screen.findByRole("dialog", { name: "Preview backup" });
    expect(within(dialog).getByText("empty-backup.json")).toBeInTheDocument();
    expect(within(dialog).getByRole("row", { name: "Characters 1 0" })).toBeInTheDocument();
    expect(within(dialog).getByRole("row", { name: "Custom BiS lists 1 0" })).toBeInTheDocument();
    expect(localStorage.getItem(WORKSPACE_SAVE_KEY)).toBeNull();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(readSnapshot()).toEqual(initialSnapshot);
    expect(localStorage.getItem(WORKSPACE_SAVE_KEY)).toBeNull();
  });

  it("reports a damaged file in Russian without a confirmation", async () => {
    renderWithTheme(<RaidTrackerProvider><DataControlsHarness /></RaidTrackerProvider>, { locale: "ru" });
    selectBackup(new File(["{"], "broken.json"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/неполная резервная копия Raidwise/);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(readSnapshot()).toEqual(initialSnapshot);
  });

  it("reports that the file is too large without reading or applying it", async () => {
    renderWithTheme(<RaidTrackerProvider><DataControlsHarness /></RaidTrackerProvider>);
    const file = new File(["{}"], "large.json");
    Object.defineProperty(file, "size", { value: MAX_BACKUP_BYTES + 1 });
    const read = vi.spyOn(file, "text");
    selectBackup(file);
    expect(await screen.findByRole("alert")).toHaveTextContent(/10 MiB/);
    expect(read).not.toHaveBeenCalled();
    expect(localStorage.getItem(WORKSPACE_SAVE_KEY)).toBeNull();
  });

  it("keeps the preview open and reports a concurrent change to the save", async () => {
    renderWithTheme(<RaidTrackerProvider><DataControlsHarness /></RaidTrackerProvider>);
    selectBackup(new File([createWorkspaceBackup(emptySave)], "empty.json"));
    const dialog = await screen.findByRole("dialog", { name: "Preview backup" });
    localStorage.setItem("raidwise-bis-lists", emptySave.bisLists);
    fireEvent.click(within(dialog).getByRole("button", { name: "Replace workspace data" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/changed after you chose the file/);
    expect(localStorage.getItem("raidwise-bis-lists")).toBe(emptySave.bisLists);
    expect(localStorage.getItem(WORKSPACE_SAVE_KEY)).toBeNull();
    expect(readSnapshot()).toEqual(initialSnapshot);
  });

  it("writes a normal tracker edit after restore without replacing the BiS section", async () => {
    const before = { tracker: localStorage.getItem("raidwise")!, bisLists: localStorage.getItem("raidwise-bis-lists")! };
    writeWorkspaceSave(before);
    renderWithTheme(<RaidTrackerProvider><DataControlsHarness /></RaidTrackerProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Reset all toggles" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(loadRaidTrackerState().state.dungeonToggles).toEqual({}));
    expect(JSON.parse(localStorage.getItem(WORKSPACE_SAVE_KEY)!).bisLists).toBe(before.bisLists);
    expect(localStorage.getItem("raidwise")).toBe(before.tracker);
  });

  it("blocks full backup and replacement when a local section has a newer schema", async () => {
    localStorage.setItem("raidwise-bis-lists", '{"schemaVersion":99,"entries":{}}');
    renderWithTheme(<RaidTrackerProvider><DataControlsHarness /></RaidTrackerProvider>);
    expect(screen.getByRole("button", { name: "Download workspace backup" })).toBeDisabled();
    selectBackup(new File([createWorkspaceBackup(emptySave)], "empty.json"));
    const dialog = await screen.findByRole("dialog", { name: "Preview backup" });
    expect(within(dialog).getByRole("button", { name: "Replace workspace data" })).toBeDisabled();
    expect(localStorage.getItem(WORKSPACE_SAVE_KEY)).toBeNull();
  });
});
