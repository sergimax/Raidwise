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

  it("renders stepped identity fields and inactive WowSims import", () => {
    renderWithTheme(<CharacterForm {...defaultProps} />);

    const stepTitle = (expected: string) =>
      screen.getByText((_, element) => {
        return element?.tagName === "P" && element.textContent === expected;
      });

    expect(stepTitle("1.Name and class")).toBeInTheDocument();
    expect(stepTitle("2.Main specialization(optional)")).toBeInTheDocument();
    expect(stepTitle("3.Off specialization(optional)")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Name/ })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /^Class/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add character" })).toBeInTheDocument();

    const importFields = screen.getAllByRole("textbox", {
      name: /WowSimsExporter/i,
    });
    expect(importFields).toHaveLength(2);
    expect(importFields[0]).toBeDisabled();
    expect(importFields[1]).toBeDisabled();
    expect(
      screen.getAllByText(/Choose a class first to enable WowSimsExporter import/i),
    ).toHaveLength(2);
  });

  it("keeps WowSims import disabled until a specialization is chosen", () => {
    renderWithTheme(
      <CharacterForm {...defaultProps} characterClass={Classes[0]} />,
    );

    const importFields = screen.getAllByRole("textbox", {
      name: /WowSimsExporter/i,
    });
    expect(importFields[0]).toBeDisabled();
    expect(
      screen.getAllByText(/Choose a specialization first to enable import/i),
    ).toHaveLength(2);
  });

  it("enables main WowSims import after main specialization is set", () => {
    renderWithTheme(
      <CharacterForm
        {...defaultProps}
        characterClass={Classes[0]}
        mainSpec="Blood"
      />,
    );

    const importFields = screen.getAllByRole("textbox", {
      name: /WowSimsExporter/i,
    });
    expect(importFields[0]).not.toBeDisabled();
    expect(importFields[1]).toBeDisabled();
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
