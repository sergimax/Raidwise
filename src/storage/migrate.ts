/**
 * Tracker localStorage migrations (`my-raid-cds` key).
 *
 * Runs on load before row parsers in `parse.ts`. Steps are sequential and
 * idempotent enough that re-running a later step on already-migrated data is safe.
 *
 * When adding a new schema version:
 * 1. Bump `CURRENT_SCHEMA_VERSION` in `constants.ts`
 * 2. Add `migrateToV{N}` below and call it from `migrateStoredPayload`
 * 3. Keep `parse.ts` tolerant of leftover legacy fields (safety net)
 * 4. Extend `migrate.test.ts` with a fixture for the old shape
 *
 * Hand-editing saves: prefer fixing here (or writing a one-off migrate step)
 * rather than only patching parsers — migrations run once per load and stamp
 * `schemaVersion` so the next save persists the cleaned shape.
 */
import { DungeonDifficulty } from "../types/dungeons.ts";
import { CURRENT_SCHEMA_VERSION } from "./constants.ts";
import { isRecord } from "./guards.ts";
import type {
  StoredCharacter,
  StoredCharacterSpecGear,
  StoredDungeon,
  StoredPayload,
} from "./types.ts";

/** Drop legacy `mode` after `difficulty` is present (or after we derive it). */
function withoutMode(dungeon: StoredDungeon): StoredDungeon {
  if (!("mode" in dungeon)) {
    return dungeon;
  }
  const rest = { ...dungeon };
  delete rest.mode;
  return rest;
}

/**
 * Older dungeon rows used `mode: "Normal" | "Heroic"` instead of `difficulty`.
 * Keep existing `difficulty` if set; otherwise map `mode` (missing → Normal).
 */
function migrateDungeonModeToDifficulty(dungeon: StoredDungeon): StoredDungeon {
  if (dungeon.difficulty !== undefined) {
    return withoutMode(dungeon);
  }

  const difficulty =
    dungeon.mode === DungeonDifficulty.HEROIC
      ? DungeonDifficulty.HEROIC
      : DungeonDifficulty.NORMAL;
  return { ...withoutMode(dungeon), difficulty };
}

/**
 * Collapse legacy character gear fields into `mainSpec` / `offSpec` objects.
 *
 * Historical shapes still seen in old saves:
 * - `mainSpec: "Unholy"` (string) + optional top-level `gearScore`
 * - `mainSpec: { spec, gearScore? }` + top-level `gearItems` (v4-era)
 * - `offSpec: "Blood"` (string)
 *
 * After this helper, gear lives only under the spec objects. Parsers may still
 * accept leftovers if a hand-edited JSON skips a step.
 */
function migrateCharacterSpecShapes(character: StoredCharacter): StoredCharacter {
  let next: StoredCharacter = { ...character };

  if (typeof next.mainSpec === "string") {
    const mainSpec: StoredCharacterSpecGear = { spec: next.mainSpec };
    if (typeof next.gearScore === "number") {
      mainSpec.gearScore = next.gearScore;
    }
    if (next.gearItems) {
      mainSpec.gearItems = next.gearItems;
    }
    next = { ...next, mainSpec };
    delete next.gearScore;
    delete next.gearItems;
  } else if (next.mainSpec && isRecord(next.mainSpec)) {
    const mainSpec: StoredCharacterSpecGear = { ...next.mainSpec };
    if (next.gearItems && !mainSpec.gearItems) {
      mainSpec.gearItems = next.gearItems;
    }
    if (typeof next.gearScore === "number" && mainSpec.gearScore === undefined) {
      mainSpec.gearScore = next.gearScore;
    }
    next = { ...next, mainSpec };
    delete next.gearScore;
    delete next.gearItems;
  } else {
    delete next.gearScore;
    delete next.gearItems;
  }

  if (typeof next.offSpec === "string") {
    next = { ...next, offSpec: { spec: next.offSpec } };
  }

  return next;
}

/** v1 — first versioned payload (`schemaVersion` introduced). Stamp only. */
function migrateToV1(payload: StoredPayload): StoredPayload {
  return { ...payload, schemaVersion: 1 };
}

/**
 * v2 — characters may still use flat spec strings / top-level `gearScore`.
 * No JSON rewrite here; v3+ normalizes. Stamp only so version history is linear.
 */
function migrateToV2(payload: StoredPayload): StoredPayload {
  return { ...payload, schemaVersion: 2 };
}

/**
 * v3 — wrap string `mainSpec` / `offSpec` as `{ spec }` and fold top-level
 * `gearScore` into mainSpec when present. Does not move `gearItems` yet (v4).
 */
function migrateToV3(payload: StoredPayload): StoredPayload {
  return {
    ...payload,
    schemaVersion: 3,
    characters: payload.characters.map((character) => {
      let next = { ...character };
      if (typeof next.mainSpec === "string") {
        const mainSpec: StoredCharacterSpecGear = { spec: next.mainSpec };
        if (typeof next.gearScore === "number") {
          mainSpec.gearScore = next.gearScore;
        }
        next = { ...next, mainSpec };
        delete next.gearScore;
      }
      if (typeof next.offSpec === "string") {
        next = { ...next, offSpec: { spec: next.offSpec } };
      }
      return next;
    }),
  };
}

/**
 * v4 — move top-level `gearItems` onto `mainSpec.gearItems` (WowSims import era).
 * Reuses {@link migrateCharacterSpecShapes} so string specs are covered too.
 */
function migrateToV4(payload: StoredPayload): StoredPayload {
  return {
    ...payload,
    schemaVersion: 4,
    characters: payload.characters.map((character) =>
      migrateCharacterSpecShapes(character),
    ),
  };
}

/**
 * v5 — dungeon `mode` → `difficulty`; re-apply character nesting for any save
 * that jumped versions or was hand-edited between releases.
 */
function migrateToV5(payload: StoredPayload): StoredPayload {
  return {
    ...payload,
    schemaVersion: 5,
    dungeons: payload.dungeons.map(migrateDungeonModeToDifficulty),
    characters: payload.characters.map((character) =>
      migrateCharacterSpecShapes(character),
    ),
  };
}

/**
 * v6 — optional character `alsoOwnedItemIds` (owned/available gear beyond WowSims).
 * Stamp-only; parsers accept the new field when present.
 */
function migrateToV6(payload: StoredPayload): StoredPayload {
  return {
    ...payload,
    schemaVersion: 6,
  };
}

/**
 * Walk `schemaVersion` from the stored value (or 0 if missing) up to
 * {@link CURRENT_SCHEMA_VERSION}, applying each step in order.
 *
 * Unknown future versions are clamped to current via the final stamp.
 * Do not reorder or skip steps — older browsers may still hold mid-version JSON.
 */
export function migrateStoredPayload(payload: StoredPayload): StoredPayload {
  let next = payload;
  let version =
    typeof next.schemaVersion === "number" && Number.isFinite(next.schemaVersion)
      ? next.schemaVersion
      : 0;

  if (version < 1) {
    next = migrateToV1(next);
    version = 1;
  }
  if (version < 2) {
    next = migrateToV2(next);
    version = 2;
  }
  if (version < 3) {
    next = migrateToV3(next);
    version = 3;
  }
  if (version < 4) {
    next = migrateToV4(next);
    version = 4;
  }
  if (version < 5) {
    next = migrateToV5(next);
    version = 5;
  }
  if (version < 6) {
    next = migrateToV6(next);
    version = 6;
  }

  if (version !== CURRENT_SCHEMA_VERSION) {
    return { ...next, schemaVersion: CURRENT_SCHEMA_VERSION };
  }

  return next;
}
