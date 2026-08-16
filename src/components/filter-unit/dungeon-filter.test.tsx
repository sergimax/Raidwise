import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { createTestDungeon } from "../../test/fixtures.ts";
import { testTranslator } from "../../test/i18n.ts";
import { renderWithTheme } from "../../test/render-with-theme.tsx";
import { DungeonFilter } from "./dungeon-filter.tsx";

function FilterHarness({
  initialExcludedIds = [] as string[],
}: {
  initialExcludedIds?: string[];
}) {
  const [dungeonNameSearch, setDungeonNameSearch] = useState("");
  const [excludedDungeonIds, setExcludedDungeonIds] = useState(
    () => new Set(initialExcludedIds),
  );
  const icc = createTestDungeon({
    id: "icc",
    name: "Icecrown Citadel",
    shortName: "ICC",
    size: 25,
  });
  const toc = createTestDungeon({
    id: "toc",
    name: "Trial of the Crusader",
    shortName: "ToC",
    size: 25,
  });

  return (
    <DungeonFilter
      dungeonNameSearch={dungeonNameSearch}
      onDungeonNameSearchChange={setDungeonNameSearch}
      visibleDungeons={[icc, toc]}
      excludedDungeonIds={excludedDungeonIds}
      onToggleDungeonExcluded={(dungeonId) => {
        setExcludedDungeonIds((previous) => {
          const next = new Set(previous);
          if (next.has(dungeonId)) {
            next.delete(dungeonId);
          } else {
            next.add(dungeonId);
          }
          return next;
        });
      }}
      locale="en"
      t={testTranslator}
    />
  );
}

describe("DungeonFilter", () => {
  it("keeps the raid search field editable and in sync with local state", async () => {
    const user = userEvent.setup();
    renderWithTheme(<FilterHarness />);

    const search = screen.getByLabelText(
      "Filter by raid name, name+size, or name+size+mode — e.g. ICC, Uld10, ICC25N, or ToC25H",
    );

    await user.type(search, "ICC");
    expect(search).toHaveValue("ICC");
  });

  it("toggles a chip between active and passive while keeping it visible", async () => {
    const user = userEvent.setup();
    renderWithTheme(<FilterHarness />);

    expect(screen.getByText("2 of 2 selected")).toBeInTheDocument();

    const tocChip = screen.getByRole("button", {
      name: /Exclude ToC25 from character pick/i,
    });
    await user.click(tocChip);

    expect(screen.getByText("1 of 2 selected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Include ToC25 in character pick/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("ToC25")).toBeInTheDocument();
  });
});
