import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacterPickSessionState } from "../../hooks/use-character-pick-session-state.ts";
import { useGearPickSessionState } from "../../hooks/use-gear-pick-session-state.ts";
import { createTestCharacter, createTestDungeon } from "../../test/fixtures.ts";
import { renderWithTheme, screen, waitFor } from "../../test/render-with-theme.tsx";
import { ClassName, Classes } from "../../types/characters.ts";
import { DungeonDifficulty } from "../../types/dungeons.ts";
import { CharacterPickPanel } from "../character-pick-panel/index.tsx";
import { GearPickPanel } from "./index.tsx";

const paladinClass = Classes.find((entry) => entry.name === ClassName.Paladin)!;
const characters = [
  createTestCharacter({
    id: "alpha",
    name: "Alpha",
    class: paladinClass,
    mainSpec: {
      spec: "Retribution",
      gearItems: [
        { slot: 1, id: 37646 },
        { slot: 9, id: 37646 },
        { slot: 11, id: 37646 },
        { slot: 13, id: 37646 },
      ],
    },
  }),
  createTestCharacter({
    id: "beta",
    name: "Beta",
    class: paladinClass,
    mainSpec: {
      spec: "Retribution",
      gearItems: [
        { slot: 1, id: 37646 },
        { slot: 9, id: 37646 },
        { slot: 11, id: 37646 },
        { slot: 13, id: 37646 },
      ],
    },
  }),
];
const dungeons = [
  createTestDungeon({
    id: "ruby",
    name: "The Ruby Sanctum",
    raidKey: "rubySanctum",
    size: 25,
    difficulty: DungeonDifficulty.HEROIC,
    itemLevel: [284],
  }),
  createTestDungeon({ id: "empty", name: "Empty raid" }),
];

function GearPickHarness() {
  const session = useGearPickSessionState();
  const rosterSession = useCharacterPickSessionState();
  const [open, setOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<"soft" | "roster">("soft");
  const [search, setSearch] = useState("");
  const [allOnCooldown, setAllOnCooldown] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen((previous) => !previous)}>
        Toggle soft pick panel
      </button>
      <button
        type="button"
        onClick={() =>
          setActivePanel((previous) => (previous === "soft" ? "roster" : "soft"))
        }
      >
        Switch pick panel
      </button>
      <button type="button" onClick={() => setAllOnCooldown((previous) => !previous)}>
        Toggle all cooldowns
      </button>
      {open && activePanel === "soft" ? (
        <GearPickPanel
          characters={characters}
          visibleDungeons={dungeons.filter((dungeon) =>
            dungeon.name.toLowerCase().includes(search.toLowerCase()),
          )}
          dungeonToggles={
            allOnCooldown ? { alpha: { ruby: true, empty: true } } : {}
          }
          dungeonNameSearch={search}
          onDungeonNameSearchChange={setSearch}
          totalDungeonCount={dungeons.length}
          session={session}
        />
      ) : open && activePanel === "roster" ? (
        <CharacterPickPanel
          characters={characters}
          visibleDungeons={dungeons}
          dungeonToggles={{}}
          dungeonNameSearch={search}
          onDungeonNameSearchChange={setSearch}
          totalDungeonCount={dungeons.length}
          session={rosterSession}
        />
      ) : null}
    </>
  );
}

describe("GearPickPanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("enforces the soft budget, keeps the session on reopen, and prunes filtered items", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderWithTheme(<GearPickHarness />);

    await user.click(screen.getByRole("radio", { name: /Select Retribution for Alpha/i }));
    const increaseButtons = () =>
      screen.getAllByRole("button", { name: /Increase soft reserves for/i });
    expect(increaseButtons().length).toBeGreaterThan(1);
    const itemName = increaseButtons()[0]!
      .getAttribute("aria-label")!
      .replace("Increase soft reserves for ", "");

    await user.click(increaseButtons()[0]!);
    await user.click(increaseButtons()[0]!);
    await user.click(increaseButtons()[0]!);
    expect(screen.getByText("3 / 3 softs used")).toBeInTheDocument();
    expect(increaseButtons().every((button) => button.hasAttribute("disabled"))).toBe(true);

    await user.click(
      screen.getAllByRole("button", { name: "Maximum soft rolls allowed for this raid" })[0]!,
    );
    expect(screen.getByText("2 / 2 softs used")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Toggle soft pick panel" }));
    await user.click(screen.getByRole("button", { name: "Toggle soft pick panel" }));
    expect(screen.getByText("2 / 2 softs used")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copy soft reserve call list" }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(itemName));

    await user.click(screen.getByRole("button", { name: "Toggle all cooldowns" }));
    expect(screen.getByRole("button", { name: "Copy soft reserve call list" })).toBeDisabled();
    expect(screen.getByText("2 / 2 softs used")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Toggle all cooldowns" }));
    expect(screen.getByRole("button", { name: "Copy soft reserve call list" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /Exclude RS25H/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy soft reserve call list" })).toBeDisabled();
    });
    await user.click(screen.getByRole("button", { name: /Include RS25H/i }));
    expect(screen.getByText("0 / 2 softs used")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy soft reserve call list" })).toBeDisabled();
  }, 15_000);

  it("clears assignments on character change and keeps soft settings across panels", async () => {
    const user = userEvent.setup();
    renderWithTheme(<GearPickHarness />);

    await user.click(screen.getByRole("radio", { name: /Select Retribution for Alpha/i }));
    await user.click(screen.getAllByRole("button", { name: /Increase soft reserves for/i })[0]!);
    expect(screen.getByText("1 / 3 softs used")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Select Retribution for Beta/i }));
    expect(screen.getByText("0 / 3 softs used")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Increase soft reserves for/i })[0]!);
    await user.click(
      screen.getAllByRole("button", { name: "Maximum soft rolls allowed for this raid" })[0]!,
    );
    expect(screen.getByText("1 / 2 softs used")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Switch pick panel" }));
    expect(screen.getByRole("table", { name: "Who fits for the raid" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Switch pick panel" }));

    expect(screen.getByRole("radio", { name: /Select Retribution for Beta/i })).toBeChecked();
    expect(screen.getByText("1 / 2 softs used")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy soft reserve call list" })).toBeEnabled();
  }, 15_000);
});
