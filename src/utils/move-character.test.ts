import { describe, expect, it } from "vitest";
import {
  getCharacterOrderNeighbors,
  moveCharacterInList,
} from "./move-character.ts";

describe("moveCharacterInList", () => {
  const list = [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
    { id: "c", name: "C" },
  ];

  it("moves left and right by one step", () => {
    expect(moveCharacterInList(list, "b", -1).map((item) => item.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(moveCharacterInList(list, "b", 1).map((item) => item.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("is a no-op at ends or for unknown ids", () => {
    expect(moveCharacterInList(list, "a", -1)).toBe(list);
    expect(moveCharacterInList(list, "c", 1)).toBe(list);
    expect(moveCharacterInList(list, "missing", 1)).toBe(list);
  });
});

describe("getCharacterOrderNeighbors", () => {
  const list = [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
    { id: "c", name: "C" },
  ];

  it("returns neighbors and move flags", () => {
    expect(getCharacterOrderNeighbors(list, "a")).toMatchObject({
      index: 0,
      left: null,
      right: { id: "b" },
      canMoveLeft: false,
      canMoveRight: true,
    });
    expect(getCharacterOrderNeighbors(list, "b")).toMatchObject({
      index: 1,
      left: { id: "a" },
      right: { id: "c" },
      canMoveLeft: true,
      canMoveRight: true,
    });
    expect(getCharacterOrderNeighbors(list, "c")).toMatchObject({
      index: 2,
      left: { id: "b" },
      right: null,
      canMoveLeft: true,
      canMoveRight: false,
    });
  });
});
