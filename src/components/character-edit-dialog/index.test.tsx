import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestCharacter } from "../../test/fixtures.ts";
import { fireEvent, renderWithTheme, screen } from "../../test/render-with-theme.tsx";
import { Classes, ClassName, type CharacterRecord, type CharacterSpecGearUpdate } from "../../types/characters.ts";
import { CharacterEditDialog } from "./index.tsx";

const exportJson = JSON.stringify({
  class: "shaman",
  name: "Rhee",
  spec: "enhancement",
  gear: {
    items: [
      { id: 51197, enchant: 3817, gems: [41398, 40118] },
      { id: 50452 },
    ],
  },
});

const initialCharacter = createTestCharacter({
  id: "rhee",
  name: "Rhee",
  class: Classes.find((entry) => entry.name === ClassName.Shaman),
  mainSpec: { spec: "Enhancement", gearScore: 6200 },
});

function CharacterEditHarness({
  onSave,
}: {
  onSave: (id: string, update: CharacterSpecGearUpdate) => void;
}) {
  const [character, setCharacter] = useState<CharacterRecord>(initialCharacter);
  const [open, setOpen] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Reopen editor
      </button>
      <CharacterEditDialog
        character={open ? character : null}
        characters={[character]}
        onClose={() => setOpen(false)}
        onSave={(id, update) => {
          onSave(id, update);
          setCharacter((previous) => ({ ...previous, ...update }));
        }}
        onMoveCharacter={() => {}}
      />
    </>
  );
}

describe("CharacterEditDialog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("imports gear, saves it with the spec, and restores it when reopened", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderWithTheme(<CharacterEditHarness onSave={onSave} />);

    fireEvent.change(
      screen.getAllByRole("textbox", { name: "WowSimsExporter JSON" })[0],
      { target: { value: exportJson } },
    );
    await user.click(screen.getAllByRole("button", { name: "Import gear" })[0]);
    expect(screen.getByRole("button", { name: "Clear gear" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith("rhee", {
      mainSpec: {
        spec: "Enhancement",
        gearScore: 6200,
        gearItems: [
          { slot: 0, id: 51197, enchant: 3817, gems: [41398, 40118] },
          { slot: 1, id: 50452 },
        ],
      },
      offSpec: undefined,
      alsoOwnedItemIds: [],
    });

    await user.click(await screen.findByRole("button", { name: "Reopen editor" }));
    expect(screen.getByRole("button", { name: "Clear gear" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Clear gear" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenLastCalledWith("rhee", {
      mainSpec: { spec: "Enhancement", gearScore: 6200 },
      offSpec: undefined,
      alsoOwnedItemIds: [],
    });
  });

  it("reports invalid export JSON without importing gear", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderWithTheme(<CharacterEditHarness onSave={onSave} />);

    fireEvent.change(
      screen.getAllByRole("textbox", { name: "WowSimsExporter JSON" })[0],
      { target: { value: "{invalid" } },
    );
    await user.click(screen.getAllByRole("button", { name: "Import gear" })[0]);
    expect(screen.getByText("Invalid JSON. Copy the full export from /wse export.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear gear" })).not.toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
