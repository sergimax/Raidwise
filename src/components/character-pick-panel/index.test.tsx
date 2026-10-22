import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacterPickSessionState } from "../../hooks/use-character-pick-session-state.ts";
import {
  createTestCharacter,
  createTestDungeon,
} from "../../test/fixtures.ts";
import { renderWithTheme, screen } from "../../test/render-with-theme.tsx";
import { CharacterPickPanel } from "./index.tsx";

const characters = [
  createTestCharacter({
    id: "alpha",
    name: "Alpha",
    mainSpec: { spec: "Blood", gearScore: 5800 },
  }),
];
const dungeons = [
  createTestDungeon({ id: "citadel", name: "Citadel" }),
  createTestDungeon({ id: "ulduar", name: "Ulduar" }),
];

function CharacterPickHarness() {
  const session = useCharacterPickSessionState();
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [allOnCooldown, setAllOnCooldown] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen((previous) => !previous)}>
        Toggle roster panel
      </button>
      <button type="button" onClick={() => setAllOnCooldown((previous) => !previous)}>
        Toggle all cooldowns
      </button>
      {open ? (
        <CharacterPickPanel
          characters={characters}
          visibleDungeons={dungeons.filter((dungeon) =>
            dungeon.name.toLowerCase().includes(search.toLowerCase()),
          )}
          dungeonToggles={
            allOnCooldown ? { alpha: { citadel: true, ulduar: true } } : {}
          }
          dungeonNameSearch={search}
          onDungeonNameSearchChange={setSearch}
          totalDungeonCount={dungeons.length}
          session={session}
        />
      ) : null}
    </>
  );
}

describe("CharacterPickPanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("updates export lines for raid and spec filters and preserves session filters when reopened", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderWithTheme(<CharacterPickHarness />);

    const copyButtons = () =>
      screen.getAllByRole("button", { name: /Copy signup line for/i });
    expect(copyButtons()).toHaveLength(2);

    await user.click(
      screen.getByRole("button", { name: /Exclude Citadel.*from character pick/i }),
    );
    expect(copyButtons()).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Toggle roster panel" }));
    await user.click(screen.getByRole("button", { name: "Toggle roster panel" }));
    expect(copyButtons()).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: /Include Citadel.*in character pick/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Clear raid search and include all raid chips",
      }),
    );
    expect(copyButtons()).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Clear all character specs" }));
    expect(screen.queryByRole("table", { name: "Who fits for the raid" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Select all character specs" }));
    expect(copyButtons()).toHaveLength(2);

    await user.click(copyButtons()[0]!);
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Alpha"));
  });

  it("omits characters on cooldown or without upgrades from export lines", async () => {
    const user = userEvent.setup();
    renderWithTheme(<CharacterPickHarness />);

    const copyButtons = () =>
      screen.queryAllByRole("button", { name: /Copy signup line for/i });
    expect(copyButtons()).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Toggle all cooldowns" }));
    expect(copyButtons()).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Toggle all cooldowns" }));
    expect(copyButtons()).toHaveLength(2);

    await user.click(screen.getByRole("switch", {
      name: "Dim and disable characters without BiS upgrades in the selected raids",
    }));
    expect(copyButtons()).toHaveLength(0);
  });
});
