import { describe, expect, it } from "vitest";
import {
  parseMixSlotLabel,
  resolveMixListLines,
} from "./bis-resolve-mix.mjs";

describe("parseMixSlotLabel", () => {
  it("maps numbered weapons and specials", () => {
    expect(parseMixSlotLabel("Оружие 1")).toEqual({ slot: 14 });
    expect(parseMixSlotLabel("Оружие 1-2")).toEqual({ slot: 14 });
    expect(parseMixSlotLabel("Оружие 2")).toEqual({ slot: 15 });
    expect(parseMixSlotLabel("Оружие 3-1")).toEqual({ slot: 16 });
    expect(parseMixSlotLabel("Оружие")).toEqual({ slot: -1 });
    expect(parseMixSlotLabel("Щит")).toEqual({ slot: 15 });
    expect(parseMixSlotLabel("Оффхэнд")).toEqual({ slot: 15 });
    expect(parseMixSlotLabel("Жезл")).toEqual({ slot: 16 });
  });

  it("maps rings, trinkets, and armor with alternatives", () => {
    expect(parseMixSlotLabel("Кольцо 1")).toEqual({ slot: 10 });
    expect(parseMixSlotLabel("Кольцо 2-1")).toEqual({ slot: 11 });
    expect(parseMixSlotLabel("Аксессуар 1")).toEqual({ slot: 12 });
    expect(parseMixSlotLabel("Аксессуар 2-3")).toEqual({ slot: 13 });
    expect(parseMixSlotLabel("Грудь 1-2")).toEqual({ slot: 4 });
    expect(parseMixSlotLabel("Голова")).toEqual({ slot: 0 });
  });
});

describe("resolveMixListLines alternatives", () => {
  it("appends alternative labels to the same slot in document order", () => {
    const { slots, unknown } = resolveMixListLines("Warrior", "Protection", [
      "- Оружие 1: Зов хаоса, топор королей Лордерона (ЦЛК 25 хм)",
      "- Оружие 1-1: Митриос, наследие Бронзоборода (ЦЛК 25 хм)",
      "- Оружие 1-2: Клинок отравленной крови (ЦЛК 25 хм)",
      "- Щит: Мерзлая стена Ледяной Цитадели (ЦЛК 25 хм)",
    ]);

    expect(unknown).toEqual([]);
    expect(slots.find((entry) => entry.slot === 14)?.itemIds).toEqual([
      50737, 50738, 50672,
    ]);
    expect(slots.find((entry) => entry.slot === 15)?.itemIds).toEqual([50729]);
  });
});
