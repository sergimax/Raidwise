import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { createTestDungeon } from "../../test/fixtures.ts";
import { testTranslator } from "../../test/i18n.ts";
import { renderWithTheme } from "../../test/render-with-theme.tsx";
import { ExportDungeonFilter } from "./export-dungeon-filter.tsx";

function FilterHarness() {
  const [dungeonNameSearch, setDungeonNameSearch] = useState("");
  const dungeon = createTestDungeon({ name: "Icecrown Citadel", shortName: "ICC" });

  return (
    <ExportDungeonFilter
      dungeonNameSearch={dungeonNameSearch}
      onDungeonNameSearchChange={setDungeonNameSearch}
      visibleDungeons={[dungeon]}
      totalDungeonCount={1}
      locale="en"
      t={testTranslator}
    />
  );
}

describe("ExportDungeonFilter", () => {
  it("keeps the raid search field editable and in sync with local state", async () => {
    const user = userEvent.setup();
    renderWithTheme(<FilterHarness />);

    const search = screen.getByLabelText(
      "Filter by raid name, name+size, or name+size+mode — e.g. ICC, Uld10, ICC25N, or ToC25H",
    );

    await user.type(search, "ICC");
    expect(search).toHaveValue("ICC");
  });
});
