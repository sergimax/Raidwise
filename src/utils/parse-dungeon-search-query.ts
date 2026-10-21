import {
  DungeonDifficulty,
  DungeonSizes,
  type DungeonSize,
} from "../types/dungeons.ts";

export type ParsedDungeonSearchQuery = {
  nameQuery: string;
  size?: DungeonSize;
  difficulty?: DungeonDifficulty;
};

/** Size then mode; longer sizes first so `10` wins over `0`/`1` edge cases. */
const SIZE_WITH_MODE_PATTERN = /(40|25|20|10|5)(гер|хм|х|h|об|n)$/u;

function parseTrailingSize(value: string): { size?: DungeonSize; rest: string } {
  for (const size of [...DungeonSizes].sort((first, second) => second - first)) {
    const sizeLabel = String(size);
    if (value.endsWith(sizeLabel)) {
      return {
        size,
        rest: value.slice(0, -sizeLabel.length),
      };
    }
  }
  return { rest: value };
}

function difficultyFromModeSuffix(suffix: string): DungeonDifficulty {
  if (suffix === "об" || suffix === "n") {
    return DungeonDifficulty.NORMAL;
  }
  return DungeonDifficulty.HEROIC;
}

/**
 * Parse mixed dungeon search: raid name/short name, optional size, optional mode suffix.
 * Mode suffixes (`n`/`об` normal, `h`/`хм`/`гер`/`х` heroic) apply only after a
 * size, e.g.
 * `ICC25N`, `ЦЛК25об`, `ToC25H`, `ИК25гер` — not on bare names like `icecrown`.
 * Size without mode (`ICC25`) matches both Normal and Heroic.
 */
export function parseDungeonSearchQuery(rawQuery: string): ParsedDungeonSearchQuery {
  const query = rawQuery.trim().toLowerCase().replace(/\s+/g, "");
  if (query === "") {
    return { nameQuery: "" };
  }

  const sizeWithMode = query.match(SIZE_WITH_MODE_PATTERN);
  if (sizeWithMode) {
    const sizeLabel = sizeWithMode[1];
    const modeSuffix = sizeWithMode[2];
    const size = Number(sizeLabel) as DungeonSize;
    return {
      nameQuery: query.slice(0, -sizeWithMode[0].length),
      size,
      difficulty: difficultyFromModeSuffix(modeSuffix),
    };
  }

  const { size, rest } = parseTrailingSize(query);
  return { nameQuery: rest, size };
}
