import { describe, expect, it } from "vitest";
import { formatBisListCopyText } from "./format-bis-list-copy.ts";

describe("formatBisListCopyText", () => {
  it("formats ordered slots with localized labels and alternatives", () => {
    const text = formatBisListCopyText({
      locale: "en",
      slots: [
        { slot: 14, itemIds: [50737, 50738] },
        { slot: 0, itemIds: [51312] },
        { slot: 1, itemIds: [] },
      ],
    });

    expect(text).toBe(
      [
        "Head: Sanctified Scourgelord Helmet",
        "Main hand: Havoc's Call, Blade of Lordaeron Kings / Mithrios, Bronzebeard's Legacy",
      ].join("\n"),
    );
  });

  it("returns empty string when no items", () => {
    expect(
      formatBisListCopyText({
        locale: "en",
        slots: [{ slot: 0, itemIds: [] }],
      }),
    ).toBe("");
  });
});
