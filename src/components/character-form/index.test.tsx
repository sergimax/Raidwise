import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Classes } from "../../types/characters.ts";
import { CharacterForm } from "./index.tsx";
import { renderWithTheme, screen } from "../../test/render-with-theme.tsx";

describe("CharacterForm", () => {
  const defaultProps = {
    name: "",
    characterClass: "" as const,
    mainSpec: "",
    mainGearScoreText: "",
    offSpec: "",
    offGearScoreText: "",
    mainGearItems: undefined,
    offGearItems: undefined,
    error: "",
    onNameChange: vi.fn(),
    onClassChange: vi.fn(),
    onMainSpecChange: vi.fn(),
    onMainGearScoreTextChange: vi.fn(),
    onOffSpecChange: vi.fn(),
    onOffGearScoreTextChange: vi.fn(),
    onMainGearItemsChange: vi.fn(),
    onOffGearItemsChange: vi.fn(),
    onImportError: vi.fn(),
    onClearImportError: vi.fn(),
    onSubmit: vi.fn(),
  };

  it("renders name and class fields", () => {
    renderWithTheme(<CharacterForm {...defaultProps} />);

    expect(screen.getByRole("textbox", { name: /^Name/ })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /^Class/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add character" })).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /WowSimsExporter/i }),
    ).not.toBeInTheDocument();
  });

  it("shows WowSimsExporter import after a class is selected", () => {
    renderWithTheme(
      <CharacterForm {...defaultProps} characterClass={Classes[0]} />,
    );

    expect(
      screen.getAllByRole("textbox", { name: /WowSimsExporter/i }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: /Import gear/i }),
    ).toHaveLength(2);
  });

  it("displays validation error", () => {
    renderWithTheme(
      <CharacterForm
        {...defaultProps}
        error="Enter a name and choose a class."
      />,
    );

    expect(
      screen.getByText("Enter a name and choose a class."),
    ).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => {
      event.preventDefault();
    });

    renderWithTheme(
      <CharacterForm
        {...defaultProps}
        name="Alpha"
        onSubmit={onSubmit}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Add character" }),
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
