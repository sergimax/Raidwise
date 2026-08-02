import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BisListsPanel } from "./index.tsx";
import {
  BIS_LISTS_SCHEMA_VERSION,
  BIS_LISTS_STORAGE_KEY,
} from "../../storage/bis-lists/constants.ts";
import { ClassName } from "../../types/characters.ts";
import {
  renderWithTheme,
  screen,
  waitFor,
  within,
} from "../../test/render-with-theme.tsx";
import { specBisStorageKey } from "../../utils/bis-lists.ts";

function seedLocalUnholyPreset(presetName: string, presetId = "local-test") {
  const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
  localStorage.setItem(
    BIS_LISTS_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: BIS_LISTS_SCHEMA_VERSION,
      entries: {
        [storageKey]: {
          selectedPresetId: presetId,
          presets: [
            {
              id: presetId,
              name: presetName,
              slots: [{ slot: 0, itemIds: [51312] }],
            },
          ],
        },
      },
    }),
  );
}

describe("BisListsPanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows slot items for the default Unholy DK preset on open", () => {
    renderWithTheme(<BisListsPanel />);

    expect(screen.getByText(/Kingdom\. With variants/i)).toBeInTheDocument();
    expect(screen.getByText(/Head/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Sanctified Scourgelord Helmet/i }),
    ).toBeInTheDocument();
  });

  it("copies the currently shown BiS list to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderWithTheme(<BisListsPanel />);

    await user.click(screen.getByRole("button", { name: /Copy current BiS list/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    const copiedText = writeText.mock.calls[0]?.[0] as string;
    expect(copiedText).toContain("Head: Sanctified Scourgelord Helmet");
    expect(copiedText).toContain("Neck: Penumbra Pendant");
    expect(screen.getByRole("button", { name: /Copy current BiS list/i })).toHaveTextContent(
      /Copied/i,
    );
  });

  it("shows built-in preset items for Warrior Arms", async () => {
    const user = userEvent.setup();
    renderWithTheme(<BisListsPanel />);

    await user.click(screen.getByRole("combobox", { name: /^Class/ }));
    await user.click(screen.getByRole("option", { name: /Warrior/ }));
    await user.click(screen.getByRole("combobox", { name: /^Spec/ }));
    await user.click(screen.getByRole("option", { name: /Arms/ }));

    expect(screen.getByText(/Arms \(icy-veins/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Shadowmourne/i })).toBeInTheDocument();
  });

  it("shows built-in lists as read-only without slot edit controls", () => {
    renderWithTheme(<BisListsPanel />);

    expect(
      screen.getByText(/Built-in list \(read-only\)/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Edit Head item/i })).not.toBeInTheDocument();
  });

  it("saves a copy of the built-in list under a custom name", async () => {
    const user = userEvent.setup();
    renderWithTheme(<BisListsPanel />);

    await user.type(screen.getByRole("textbox", { name: /List name/i }), "My DK copy");
    await user.click(screen.getByRole("button", { name: /Save list/i }));

    expect(screen.getByRole("button", { name: /My DK copy/i })).toBeInTheDocument();

    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem(BIS_LISTS_STORAGE_KEY)!);
      expect(persisted.entries[storageKey].presets[0].name).toBe("My DK copy");
    });
  });

  it("shows list-name required on the Save list field", async () => {
    const user = userEvent.setup();
    renderWithTheme(<BisListsPanel />);

    await user.click(screen.getByRole("button", { name: /Save list/i }));

    const listNameField = screen.getByRole("textbox", { name: /List name/i });
    expect(listNameField).toHaveAccessibleDescription(/List name is required/i);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("disables save while edited slots are unconfirmed", async () => {
    const user = userEvent.setup();
    seedLocalUnholyPreset("Editable local");
    renderWithTheme(<BisListsPanel />);

    await user.click(screen.getByRole("button", { name: /Edit Head item/i }));
    const headInput = screen.getByPlaceholderText("Name, id, or #id");
    await user.clear(headInput);
    await user.type(headInput, "51312");

    expect(screen.getByRole("button", { name: /Save list/i })).toBeDisabled();
  });

  it("clears one slot while editing a custom list", async () => {
    const user = userEvent.setup();
    seedLocalUnholyPreset("Editable local");
    renderWithTheme(<BisListsPanel />);

    expect(
      screen.getByRole("link", { name: /Sanctified Scourgelord Helmet/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Edit Head item/i }));
    await user.click(screen.getByRole("button", { name: /Clear Head item/i }));

    expect(
      screen.queryByRole("link", { name: /Sanctified Scourgelord Helmet/i }),
    ).not.toBeInTheDocument();

    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem(BIS_LISTS_STORAGE_KEY)!);
      expect(persisted.entries[storageKey].presets[0].slots).toEqual([]);
    });
  });

  it("clears all slots on a custom list", async () => {
    const user = userEvent.setup();
    seedLocalUnholyPreset("Editable local");
    renderWithTheme(<BisListsPanel />);

    await user.click(screen.getByRole("button", { name: /Clear all BiS list slots/i }));

    expect(
      screen.queryByRole("link", { name: /Sanctified Scourgelord Helmet/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Clear all BiS list slots/i })).toBeDisabled();

    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem(BIS_LISTS_STORAGE_KEY)!);
      expect(persisted.entries[storageKey].presets[0].slots).toEqual([]);
    });
  });

  it("hides clear-all for built-in lists", () => {
    renderWithTheme(<BisListsPanel />);

    expect(
      screen.queryByRole("button", { name: /Clear all BiS list slots/i }),
    ).not.toBeInTheDocument();
  });

  it("shows validation errors for items in the wrong slot", async () => {
    const user = userEvent.setup();
    seedLocalUnholyPreset("Editable local");
    renderWithTheme(<BisListsPanel />);

    await user.click(screen.getByRole("button", { name: /Edit Head item/i }));
    const headInput = screen.getByPlaceholderText("Name, id, or #id");
    await user.clear(headInput);
    await user.type(headInput, "51132");
    await user.tab();

    expect(
      screen.getByText(/belongs in Hands, not Head/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Confirm Head item/i }),
    ).toBeDisabled();
  });

  it("confirms a slot edit and persists it for a local preset", async () => {
    const user = userEvent.setup();
    seedLocalUnholyPreset("Editable local");
    renderWithTheme(<BisListsPanel />);

    await user.click(screen.getByRole("button", { name: /Edit Head item/i }));
    const headInput = screen.getByPlaceholderText("Name, id, or #id");
    await user.clear(headInput);
    await user.type(headInput, "51312");
    await user.click(screen.getByRole("button", { name: /Confirm Head item/i }));

    expect(
      screen.getByRole("link", { name: /Sanctified Scourgelord Helmet/i }),
    ).toBeInTheDocument();

    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem(BIS_LISTS_STORAGE_KEY)!);
      expect(persisted.entries[storageKey].presets[0].slots).toEqual([
        { slot: 0, itemIds: [51312] },
      ]);
    });
  });

  it("deletes a local preset from the sidebar", async () => {
    const user = userEvent.setup();
    seedLocalUnholyPreset("Deletable list");
    renderWithTheme(<BisListsPanel />);

    const localChip = screen.getByRole("button", { name: /Deletable list/i });
    await user.click(within(localChip).getByTestId("CancelIcon"));

    expect(screen.queryByRole("button", { name: /Deletable list/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Udk-STR \(Warmane/i)).toBeInTheDocument();

    const storageKey = specBisStorageKey(ClassName.DeathKnight, "Unholy");
    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem(BIS_LISTS_STORAGE_KEY)!);
      expect(persisted.entries[storageKey].presets).toHaveLength(0);
    });
  });
});
