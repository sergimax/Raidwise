import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/test-providers.tsx";
import { createAppTheme } from "../../theme/create-app-theme.ts";
import { wowItemLinkColor } from "../wow-item-link/item-link-styles.ts";
import { GearPickCopyBlock } from "./gear-pick-copy-block.tsx";

describe.each(["light", "dark"] as const)("copy preview in %s mode", (mode) => {
  it("uses target-list item colours while keeping surrounding text plain", () => {
    const noop = vi.fn();
    const { container } = render(
      <ThemeProvider theme={createAppTheme(mode)}>
        <GearPickCopyBlock
          copyParts={[
            { text: "Hero:\n- " },
            { text: "Known helm", itemId: 51225 },
            { text: " Ã—2 (Boss)\n- " },
            { text: "Unknown item", itemId: 1 },
          ]}
          hasCopyItems
          includeCharacterName
          includeSpec={false}
          includeSoftCount
          includeAllItems={false}
          includeAllBisItems={false}
          compactLines={false}
          onIncludeCharacterNameChange={noop}
          onIncludeSpecChange={noop}
          onIncludeSoftCountChange={noop}
          onIncludeAllItemsChange={noop}
          onIncludeAllBisItemsChange={noop}
          onCompactLinesChange={noop}
          t={(key) => key}
        />
      </ThemeProvider>,
      { wrapper: TestProviders },
    );
    expect(screen.getByText("Known helm")).toHaveStyle({ color: wowItemLinkColor(51225, mode) });
    expect(screen.getByText("Unknown item")).toHaveStyle({ color: wowItemLinkColor(1, mode) });
    expect(container.querySelector("pre")?.textContent).toBe("Hero:\n- Known helm Ã—2 (Boss)\n- Unknown item");
  });
});
