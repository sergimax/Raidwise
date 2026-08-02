import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_DUNGEON_DIFFICULTY,
  DEFAULT_DUNGEON_FORM_SIZE,
  DEFAULT_DUNGEON_ITEM_LEVEL_TEXT,
} from "../../constants/dungeon-form-defaults.ts";
import { RaidNames } from "../../data/raid-names.ts";
import { renderWithTheme, screen } from "../../test/render-with-theme.tsx";
import { DungeonForm } from "./index.tsx";
import type { DungeonFormProps } from "./types.ts";

function renderDungeonForm(overrides: Partial<DungeonFormProps> = {}) {
  const props = {
    name: "",
    shortName: "",
    size: DEFAULT_DUNGEON_FORM_SIZE,
    itemLevelText: DEFAULT_DUNGEON_ITEM_LEVEL_TEXT,
    difficulty: DEFAULT_DUNGEON_DIFFICULTY,
    error: "",
    onNameChange: vi.fn(),
    onShortNameChange: vi.fn(),
    onSizeChange: vi.fn(),
    onItemLevelTextChange: vi.fn(),
    onDifficultyChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
  renderWithTheme(<DungeonForm {...props} />);
  return props;
}

describe("DungeonForm", () => {
  it("renders stepped raid fields including optional short name", () => {
    renderDungeonForm();

    const stepTitle = (expected: string) =>
      screen.getByText((_, element) => {
        return element?.tagName === "P" && element.textContent === expected;
      });

    expect(stepTitle("1.Name")).toBeInTheDocument();
    expect(stepTitle("2.Short name(optional)")).toBeInTheDocument();
    expect(stepTitle("3.Size and difficulty")).toBeInTheDocument();
    expect(stepTitle("4.Item levels")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /^Name/ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Short name/ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Item levels/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add raid" })).toBeInTheDocument();
  });

  it("displays validation error", () => {
    renderDungeonForm({ error: "Enter a dungeon name." });

    expect(screen.getByText("Enter a dungeon name.")).toBeInTheDocument();
  });

  it("suggests known raid names and fills short name on selection", async () => {
    const user = userEvent.setup();
    const props = renderDungeonForm();

    await user.click(screen.getByRole("combobox", { name: /^Name/ }));
    await user.click(
      screen.getByRole("option", { name: RaidNames.icecrownCitadel.en }),
    );

    expect(props.onNameChange).toHaveBeenCalledWith(RaidNames.icecrownCitadel.en);
    expect(props.onShortNameChange).toHaveBeenCalledWith(
      RaidNames.icecrownCitadel.shortEn,
    );
  });

  it("replaces short name when selecting a different known raid", async () => {
    const user = userEvent.setup();
    const props = renderDungeonForm({
      shortName: RaidNames.trialOfTheCrusader.shortRu,
    });

    await user.click(screen.getByRole("combobox", { name: /^Name/ }));
    await user.click(
      screen.getByRole("option", { name: RaidNames.icecrownCitadel.en }),
    );

    expect(props.onShortNameChange).toHaveBeenCalledWith(
      RaidNames.icecrownCitadel.shortEn,
    );
  });

  it("fills short name for English raids without shortEn guard regression", async () => {
    const user = userEvent.setup();
    const props = renderDungeonForm();

    await user.click(screen.getByRole("combobox", { name: /^Name/ }));
    await user.click(
      screen.getByRole("option", { name: RaidNames.trialOfTheCrusader.en }),
    );

    expect(props.onNameChange).toHaveBeenCalledWith(
      RaidNames.trialOfTheCrusader.en,
    );
    expect(props.onShortNameChange).toHaveBeenCalledWith(
      RaidNames.trialOfTheCrusader.shortEn,
    );
  });

  it("calls onSubmit when form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => {
      event.preventDefault();
    });

    renderDungeonForm({
      name: "My Raid",
      onSubmit,
    });

    await user.click(
      screen.getByRole("button", { name: "Add raid" }),
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
