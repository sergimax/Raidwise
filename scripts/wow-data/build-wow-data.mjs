/**
 * Builds bundled WowSims data for the app from scripts/wowsims-db.json.
 *
 * Outputs:
 * - src/data/wotlk-item-names.json — English item names for bundled ilvl ids
 * - src/data/wotlk-item-names-ru.json — Russian names from WoWRoad (by item id)
 * - src/data/wotlk-item-gear-slots.json — valid gear slot indices per item id
 * - src/data/wotlk-item-equip-props.json — item type/armor/weapon metadata for class equip rules
 * - src/data/wotlk-item-stats.json — sparse WowSims stat indices per bundled item id
 * - src/data/raid-loot-by-key.json — raid loot indexed by gear slot (VoA tier hands/legs supplemented when WowSims omits zone 4603)
 * - src/data/wotlk-item-drop-sources.json — boss / raid drop sources per bundled item id (includes Koralon/Toravon for VoA)
 * - src/data/tier-sets-by-item-id.json — tier set piece upgrade chains
 *
 * Pass --skip-ru to skip the WoWRoad Russian name fetch (network-heavy).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildItemGearSlotsMap, itemToGearSlots } from "./wow-item-gear-slots.mjs";
import {
  TIER_SET_TOKEN_EN_NAMES,
  TIER_SET_TOKEN_ITEM_IDS,
} from "./tier-set-token-names.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const WOWROAD_RU_LOCALE = 8;
const WOWROAD_FETCH_CONCURRENCY = 12;
const WOWROAD_FETCH_RETRIES = 2;

/** WowSims drop zone ids grouped by template raid key. */
const RAID_ZONE_IDS = {
  naxxramas: [3456],
  obsidianSanctum: [4493, 4494],
  onyxiasLair: [2159],
  vaultOfArchavon: [4603],
  trialOfTheCrusader: [4722, 4723],
  ulduar: [4273],
  icecrownCitadel: [4812, 4813, 4820, 4809],
  rubySanctum: [4987],
};

/** WowSims zone id → raid size when the zone encodes player count (ToC). */
const ZONE_SIZE_HINT = {
  4722: 10,
  4723: 25,
};

/** WowSims drop difficulty → raid size / heroic mode hints. */
const DROP_DIFFICULTY_HINT = {
  1: { heroic: false },
  2: { heroic: true },
  3: { size: 10, heroic: false },
  4: { size: 10, heroic: true },
  5: { size: 25, heroic: false },
  6: { size: 25, heroic: true },
  8: { size: 25, heroic: false },
};

const DUNGEON_NORMAL = "Normal";
const DUNGEON_HEROIC = "Heroic";

/** Template raid rows (mirrors src/data/dungeon-list.ts). */
const DUNGEON_TEMPLATES = [
  { raidKey: "naxxramas", size: 10, difficulty: DUNGEON_NORMAL, itemLevel: [200] },
  { raidKey: "naxxramas", size: 25, difficulty: DUNGEON_NORMAL, itemLevel: [213] },
  { raidKey: "obsidianSanctum", size: 10, difficulty: DUNGEON_NORMAL, itemLevel: [200, 213] },
  { raidKey: "obsidianSanctum", size: 25, difficulty: DUNGEON_NORMAL, itemLevel: [213, 226] },
  { raidKey: "onyxiasLair", size: 10, difficulty: DUNGEON_NORMAL, itemLevel: [232] },
  { raidKey: "onyxiasLair", size: 25, difficulty: DUNGEON_NORMAL, itemLevel: [245] },
  { raidKey: "vaultOfArchavon", size: 10, difficulty: DUNGEON_NORMAL, itemLevel: [232, 251] },
  { raidKey: "vaultOfArchavon", size: 25, difficulty: DUNGEON_NORMAL, itemLevel: [245, 264] },
  { raidKey: "trialOfTheCrusader", size: 10, difficulty: DUNGEON_NORMAL, itemLevel: [232] },
  { raidKey: "trialOfTheCrusader", size: 10, difficulty: DUNGEON_HEROIC, itemLevel: [245] },
  { raidKey: "trialOfTheCrusader", size: 25, difficulty: DUNGEON_NORMAL, itemLevel: [245] },
  { raidKey: "trialOfTheCrusader", size: 25, difficulty: DUNGEON_HEROIC, itemLevel: [258] },
  { raidKey: "ulduar", size: 10, difficulty: DUNGEON_NORMAL, itemLevel: [219, 232] },
  { raidKey: "ulduar", size: 25, difficulty: DUNGEON_NORMAL, itemLevel: [226, 239] },
  { raidKey: "icecrownCitadel", size: 10, difficulty: DUNGEON_NORMAL, itemLevel: [251, 258] },
  { raidKey: "icecrownCitadel", size: 10, difficulty: DUNGEON_HEROIC, itemLevel: [264, 271] },
  { raidKey: "icecrownCitadel", size: 25, difficulty: DUNGEON_NORMAL, itemLevel: [264, 271] },
  { raidKey: "icecrownCitadel", size: 25, difficulty: DUNGEON_HEROIC, itemLevel: [277, 284] },
  { raidKey: "rubySanctum", size: 10, difficulty: DUNGEON_NORMAL, itemLevel: [258] },
  { raidKey: "rubySanctum", size: 10, difficulty: DUNGEON_HEROIC, itemLevel: [271] },
  { raidKey: "rubySanctum", size: 25, difficulty: DUNGEON_NORMAL, itemLevel: [271] },
  { raidKey: "rubySanctum", size: 25, difficulty: DUNGEON_HEROIC, itemLevel: [284] },
];

const ZONE_TO_RAID_KEY = Object.fromEntries(
  Object.entries(RAID_ZONE_IDS).flatMap(([raidKey, zoneIds]) =>
    zoneIds.map((zoneId) => [zoneId, raidKey]),
  ),
);

function dropsInZones(item, zoneIds) {
  const zoneSet = new Set(zoneIds);
  return (item.sources ?? []).some(
    (source) => source.drop && zoneSet.has(source.drop.zoneId),
  );
}

function buildItemNames(dbItems, itemLevelIds) {
  const itemsById = new Map(dbItems.map((item) => [item.id, item]));
  const names = {};

  for (const itemId of itemLevelIds) {
    const item = itemsById.get(Number(itemId));
    if (item?.name) {
      names[itemId] = item.name;
    }
  }

  return names;
}

function buildItemEquipProps(dbItems, itemLevelIds) {
  const itemsById = new Map(dbItems.map((item) => [item.id, item]));
  const propsByItemId = {};

  for (const itemId of itemLevelIds) {
    const item = itemsById.get(Number(itemId));
    if (!item || item.type === undefined) {
      continue;
    }

    const entry = { t: item.type };
    if (item.armorType) {
      entry.a = item.armorType;
    }
    if (item.weaponType) {
      entry.w = item.weaponType;
    }
    if (item.handType) {
      entry.h = item.handType;
    }
    if (item.rangedWeaponType) {
      entry.r = item.rangedWeaponType;
    }
    if (Array.isArray(item.classAllowlist) && item.classAllowlist.length > 0) {
      entry.c = item.classAllowlist;
    }

    propsByItemId[itemId] = entry;
  }

  return propsByItemId;
}

function buildItemStats(dbItems, itemLevelIds) {
  const itemsById = new Map(dbItems.map((item) => [item.id, item]));
  const statsByItemId = {};

  for (const itemId of itemLevelIds) {
    const item = itemsById.get(Number(itemId));
    if (!item?.stats) {
      continue;
    }

    const sparseStats = {};
    for (let statIndex = 0; statIndex < item.stats.length; statIndex += 1) {
      const value = item.stats[statIndex];
      if (value > 0) {
        sparseStats[String(statIndex)] = value;
      }
    }

    if (Object.keys(sparseStats).length > 0) {
      statsByItemId[itemId] = sparseStats;
    }
  }

  return statsByItemId;
}

function buildRaidLoot(dbItems, itemLevelIds) {
  const bundledItemIds = new Set(itemLevelIds);
  const lootByKey = {};

  for (const [raidKey, zoneIds] of Object.entries(RAID_ZONE_IDS)) {
    const slotItems = {};

    for (const item of dbItems) {
      if (!bundledItemIds.has(String(item.id))) {
        continue;
      }

      if (!dropsInZones(item, zoneIds)) {
        continue;
      }

      for (const slot of itemToGearSlots(item)) {
        const slotKey = String(slot);
        if (!slotItems[slotKey]) {
          slotItems[slotKey] = new Set();
        }
        slotItems[slotKey].add(item.id);
      }
    }

    const slots = {};
    for (const [slotKey, itemIds] of Object.entries(slotItems)) {
      slots[slotKey] = {
        items: [...itemIds].sort((leftId, rightId) => leftId - rightId),
      };
    }

    lootByKey[raidKey] = { slots };
  }

  return lootByKey;
}

function getDropBossName(drop) {
  if (typeof drop.otherName === "string" && drop.otherName.length > 0) {
    return drop.otherName;
  }
  if (typeof drop.category === "string" && drop.category.length > 0) {
    return drop.category;
  }
  return undefined;
}

function matchDungeonTemplates(raidKey, itemIlvl, dropDifficulty, itemHeroic, zoneId) {
  const difficultyHint = DROP_DIFFICULTY_HINT[dropDifficulty] ?? {};
  const zoneSizeHint = ZONE_SIZE_HINT[zoneId];
  const heroic =
    itemHeroic === true
      ? true
      : difficultyHint.heroic === true
        ? true
        : difficultyHint.heroic === false
          ? false
          : undefined;
  const sizeHint = difficultyHint.size ?? zoneSizeHint;

  let candidates = DUNGEON_TEMPLATES.filter((template) => template.raidKey === raidKey);
  candidates = candidates.filter((template) => template.itemLevel.includes(itemIlvl));

  if (candidates.length === 0) {
    return [];
  }

  if (heroic !== undefined) {
    const heroicDifficulty = heroic ? DUNGEON_HEROIC : DUNGEON_NORMAL;
    const byHeroic = candidates.filter((template) => template.difficulty === heroicDifficulty);
    if (byHeroic.length > 0) {
      candidates = byHeroic;
    }
  }

  if (sizeHint !== undefined) {
    const bySize = candidates.filter((template) => template.size === sizeHint);
    if (bySize.length > 0) {
      candidates = bySize;
    }
  }

  return candidates;
}

function dropSourceKey(entry) {
  return `${entry.b}|${entry.k}|${entry.s}|${entry.d}`;
}

function buildItemDropSources(dbItems, itemLevelIds) {
  const itemsById = new Map(dbItems.map((item) => [item.id, item]));
  const sourcesByItemId = {};

  for (const itemId of itemLevelIds) {
    const item = itemsById.get(Number(itemId));
    if (!item?.sources) {
      continue;
    }

    const seen = new Set();
    const entries = [];

    for (const source of item.sources) {
      const drop = source.drop;
      if (!drop?.zoneId) {
        continue;
      }

      const raidKey = ZONE_TO_RAID_KEY[drop.zoneId];
      if (!raidKey) {
        continue;
      }

      const bossName = getDropBossName(drop);
      if (!bossName) {
        continue;
      }

      const templates = matchDungeonTemplates(
        raidKey,
        item.ilvl,
        drop.difficulty,
        item.heroic === true,
        drop.zoneId,
      );

      for (const template of templates) {
        const entry = {
          b: bossName,
          k: raidKey,
          s: template.size,
          d: template.difficulty === DUNGEON_HEROIC ? "H" : "N",
        };
        const key = dropSourceKey(entry);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        entries.push(entry);
      }
    }

    if (entries.length > 0) {
      sourcesByItemId[itemId] = entries;
    }
  }

  return sourcesByItemId;
}

const TIER_SET_GEAR_SLOTS = new Set([0, 2, 4, 6, 8, 10]);

/** ICC tier 10 set → Mark of Sanctification category. */
const T10_TOKEN_TYPE_BY_SET = {
  "Ahn'Kahar Blood Hunter's Battlegear": "protector",
  "Bloodmage's Regalia": "vanquisher",
  "Crimson Acolyte's Raiment": "conqueror",
  "Crimson Acolyte's Regalia": "conqueror",
  "Dark Coven's Regalia": "conqueror",
  "Frost Witch's Battlegear": "protector",
  "Frost Witch's Garb": "protector",
  "Frost Witch's Regalia": "protector",
  "Lasherweave Battlegear": "vanquisher",
  "Lasherweave Garb": "vanquisher",
  "Lasherweave Regalia": "vanquisher",
  "Lightsworn Battlegear": "conqueror",
  "Lightsworn Garb": "conqueror",
  "Lightsworn Plate": "conqueror",
  "Scourgelord's Battlegear": "vanquisher",
  "Scourgelord's Plate": "protector",
  "Shadowblade's Battlegear": "vanquisher",
  "Ymirjar Lord's Battlegear": "protector",
  "Ymirjar Lord's Plate": "protector",
};

/** ToC tier 9 set → Regalia / Triumph of the Grand * category. */
const T9_TOKEN_TYPE_BY_SET = {
  "Garona's Battlegear": "vanquisher",
  "Gul'dan's Regalia": "conqueror",
  "Hellscream's Battlegear": "protector",
  "Hellscream's Plate": "protector",
  "Kel'Thuzad's Regalia": "conqueror",
  "Khadgar's Regalia": "vanquisher",
  "Koltira's Battlegear": "vanquisher",
  "Koltira's Plate": "protector",
  "Liadrin's Battlegear": "conqueror",
  "Liadrin's Garb": "conqueror",
  "Liadrin's Plate": "conqueror",
  "Malfurion's Battlegear": "vanquisher",
  "Malfurion's Garb": "vanquisher",
  "Malfurion's Regalia": "vanquisher",
  "Nobundo's Battlegear": "protector",
  "Nobundo's Garb": "protector",
  "Nobundo's Regalia": "protector",
  "Runetotem's Battlegear": "vanquisher",
  "Runetotem's Garb": "vanquisher",
  "Runetotem's Regalia": "vanquisher",
  "Sunstrider's Regalia": "vanquisher",
  "Thassarian's Battlegear": "vanquisher",
  "Thassarian's Plate": "protector",
  "Thrall's Battlegear": "protector",
  "Thrall's Garb": "protector",
  "Thrall's Regalia": "protector",
  "Turalyon's Battlegear": "conqueror",
  "Turalyon's Garb": "conqueror",
  "Turalyon's Plate": "conqueror",
  "VanCleef's Battlegear": "vanquisher",
  "Velen's Raiment": "conqueror",
  "Velen's Regalia": "conqueror",
  "Windrunner's Battlegear": "protector",
  "Windrunner's Pursuit": "protector",
  "Wrynn's Battlegear": "protector",
  "Wrynn's Plate": "protector",
  "Zabra's Raiment": "conqueror",
  "Zabra's Regalia": "conqueror",
};

/** Ulduar tier 8 set → Lost * / Runed Orb category. */
const T8_TOKEN_TYPE_BY_SET = {
  "Aegis Battlegear": "conqueror",
  "Aegis Plate": "conqueror",
  "Aegis Regalia": "conqueror",
  "Darkruned Battlegear": "vanquisher",
  "Darkruned Plate": "protector",
  "Deathbringer Garb": "conqueror",
  "Nightsong Battlegear": "vanquisher",
  "Nightsong Garb": "vanquisher",
  "Nightsong Regalia": "vanquisher",
  "Sanctification Garb": "conqueror",
  "Sanctification Regalia": "conqueror",
  "Scourgestalker Battlegear": "protector",
  "Siegebreaker Battlegear": "protector",
  "Siegebreaker Plate": "protector",
  "Terrorblade Battlegear": "vanquisher",
  "Worldbreaker Battlegear": "protector",
  "Worldbreaker Garb": "protector",
  "Worldbreaker Regalia": "protector",
};

const T10_NORMAL_TOKEN_BY_TYPE = {
  vanquisher: 52025,
  protector: 52026,
  conqueror: 52027,
};

const T10_HEROIC_TOKEN_BY_TYPE = {
  vanquisher: 52028,
  protector: 52029,
  conqueror: 52030,
};

const T9_NORMAL_TOKEN_BY_TYPE = {
  vanquisher: 47559,
  protector: 47558,
  conqueror: 47557,
};

const T9_HEROIC_TOKEN_BY_TYPE = {
  vanquisher: 47554,
  protector: 47556,
  conqueror: 47555,
};

function inferTierFromItemLevels(itemLevels) {
  if (itemLevels.includes(277)) {
    return "t10";
  }
  if (itemLevels.includes(258)) {
    return "t9";
  }
  if (itemLevels.includes(245)) {
    return "t9";
  }
  return "t8";
}

function tokenTypeForSet(setName, tier) {
  if (tier === "t10") {
    return T10_TOKEN_TYPE_BY_SET[setName];
  }
  if (tier === "t9") {
    return T9_TOKEN_TYPE_BY_SET[setName];
  }
  return T8_TOKEN_TYPE_BY_SET[setName];
}

function tokenItemIdForStep(tokenType, tier, step) {
  if (!tokenType) {
    return undefined;
  }

  if (tier === "t10") {
    return step === 3
      ? T10_HEROIC_TOKEN_BY_TYPE[tokenType]
      : T10_NORMAL_TOKEN_BY_TYPE[tokenType];
  }

  if (tier === "t9") {
    return step === 3
      ? T9_HEROIC_TOKEN_BY_TYPE[tokenType]
      : T9_NORMAL_TOKEN_BY_TYPE[tokenType];
  }

  return undefined;
}

/** WowSims has no zone 4603 drops — derive VoA tier PvE loot from tier set metadata. */
const VOA_RAID_KEY = "vaultOfArchavon";

/** Koralon / Toravon drop hands and legs only (Vault of Archavon wiki). */
const VOA_DROP_SLOTS = new Set([6, 8]);

const VOA_BOSS_BY_TIER = {
  t9: "Koralon the Flame Watcher",
  t10: "Toravon the Ice Watcher",
};

/** VoA template ilvl → raid size (mirrors dungeon-list.ts). */
const VOA_ILVL_RAID_SIZE = {
  232: 10,
  245: 25,
  251: 10,
  264: 25,
};

function supplementVaultOfArchavonData(
  tierSetsByItemId,
  bundledItemIds,
  lootByKey,
  dropSourcesByItemId,
) {
  const bundledIdSet = new Set(bundledItemIds);
  const slotItems = {};

  for (const [itemIdText, entry] of Object.entries(tierSetsByItemId)) {
    if (!VOA_DROP_SLOTS.has(entry.slot)) {
      continue;
    }

    const bossName = VOA_BOSS_BY_TIER[entry.tier];
    if (!bossName) {
      continue;
    }

    const size = VOA_ILVL_RAID_SIZE[entry.itemLevel];
    if (size === undefined) {
      continue;
    }

    if (!bundledIdSet.has(itemIdText)) {
      continue;
    }

    const itemId = Number(itemIdText);
    const slotKey = String(entry.slot);
    if (!slotItems[slotKey]) {
      slotItems[slotKey] = new Set();
    }
    slotItems[slotKey].add(itemId);

    const dropEntry = {
      b: bossName,
      k: VOA_RAID_KEY,
      s: size,
      d: "N",
    };
    const dropKey = dropSourceKey(dropEntry);

    if (!dropSourcesByItemId[itemIdText]) {
      dropSourcesByItemId[itemIdText] = [];
    }

    const existingSources = dropSourcesByItemId[itemIdText];
    if (!existingSources.some((row) => dropSourceKey(row) === dropKey)) {
      existingSources.push(dropEntry);
    }
  }

  const existingVoALoot = lootByKey[VOA_RAID_KEY]?.slots ?? {};
  const slots = { ...existingVoALoot };

  for (const [slotKey, itemIds] of Object.entries(slotItems)) {
    const merged = new Set([...(slots[slotKey]?.items ?? []), ...itemIds]);
    slots[slotKey] = {
      items: [...merged].sort((leftId, rightId) => leftId - rightId),
    };
  }

  lootByKey[VOA_RAID_KEY] = { slots };
}

function buildTierSetsByItemId(dbItems) {
  const piecesBySet = {};

  for (const item of dbItems) {
    if (!item.setName || item.ilvl < 219) {
      continue;
    }

    if (item.setName.startsWith("Gladiator's")) {
      continue;
    }

    const slot = itemToGearSlots(item).find((gearSlot) =>
      TIER_SET_GEAR_SLOTS.has(gearSlot),
    );
    if (slot === undefined) {
      continue;
    }

    if (!piecesBySet[item.setName]) {
      piecesBySet[item.setName] = {};
    }
    if (!piecesBySet[item.setName][slot]) {
      piecesBySet[item.setName][slot] = [];
    }

    piecesBySet[item.setName][slot].push({
      id: item.id,
      itemLevel: item.ilvl,
    });
  }

  const tierSetsByItemId = {};

  for (const [setName, slots] of Object.entries(piecesBySet)) {
    const allItemLevels = [
      ...new Set(
        Object.values(slots).flatMap((pieces) => pieces.map((piece) => piece.itemLevel)),
      ),
    ];
    const tier = inferTierFromItemLevels(allItemLevels);
    const tokenType = tokenTypeForSet(setName, tier);
    if (!tokenType) {
      continue;
    }

    for (const [slotKey, pieces] of Object.entries(slots)) {
      const sortedPieces = [...pieces].sort(
        (leftPiece, rightPiece) => leftPiece.itemLevel - rightPiece.itemLevel,
      );
      const uniqueLevels = [
        ...new Set(sortedPieces.map((piece) => piece.itemLevel)),
      ].sort((leftLevel, rightLevel) => leftLevel - rightLevel);

      for (let index = 0; index < sortedPieces.length; index += 1) {
        const piece = sortedPieces[index];
        const step = (uniqueLevels.indexOf(piece.itemLevel) + 1);
        if (step < 1 || step > 3) {
          continue;
        }

        const prevItemLevel = uniqueLevels[step - 2];
        const prevPiece =
          prevItemLevel === undefined
            ? undefined
            : sortedPieces.find(
                (candidate) => candidate.itemLevel === prevItemLevel,
              );

        const entry = {
          setName,
          slot: Number(slotKey),
          itemLevel: piece.itemLevel,
          tier,
          step,
          tokenType,
        };

        if (prevPiece) {
          entry.prevItemId = prevPiece.id;
        }

        const tokenItemId = tokenItemIdForStep(tokenType, tier, step);
        if (tokenItemId !== undefined && step > 1) {
          entry.tokenItemId = tokenItemId;
        }

        tierSetsByItemId[String(piece.id)] = entry;
      }
    }
  }

  return tierSetsByItemId;
}

function parseWowRoadRussianName(responseText) {
  const match = responseText.match(/name_ruru:\s*'((?:\\.|[^'\\])*?)'/);
  if (!match) {
    return undefined;
  }

  return match[1].replaceAll("\\'", "'");
}

async function fetchWowRoadRussianName(itemId) {
  const url = `https://wowroad.info/ajax.php?item=${itemId}&power&locale=${WOWROAD_RU_LOCALE}`;

  for (let attempt = 0; attempt <= WOWROAD_FETCH_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "text/javascript,*/*" },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const responseText = await response.text();
      return parseWowRoadRussianName(responseText);
    } catch (error) {
      if (attempt === WOWROAD_FETCH_RETRIES) {
        console.warn(`WoWRoad name fetch failed for item ${itemId}:`, error);
        return undefined;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  return undefined;
}

async function buildRussianItemNames(itemLevelIds) {
  if (itemLevelIds.length === 0) {
    return { names: {}, resolvedCount: 0, failedCount: 0 };
  }

  const workerCount = Math.min(WOWROAD_FETCH_CONCURRENCY, itemLevelIds.length);
  const chunkSize = Math.ceil(itemLevelIds.length / workerCount);
  const chunks = [];

  for (let start = 0; start < itemLevelIds.length; start += chunkSize) {
    chunks.push(itemLevelIds.slice(start, start + chunkSize));
  }

  const progress = {
    processed: 0,
    resolved: 0,
    logIfNeeded() {
      if (this.processed % 250 === 0 || this.processed === itemLevelIds.length) {
        console.log(
          `WoWRoad RU names: ${this.processed}/${itemLevelIds.length} processed (${this.resolved} resolved)`,
        );
      }
    },
    record(itemResolved) {
      this.processed += 1;
      if (itemResolved) {
        this.resolved += 1;
      }
      this.logIfNeeded();
    },
  };

  async function processChunk(chunk) {
    const chunkNames = {};
    let chunkResolved = 0;
    let chunkFailed = 0;

    for (const itemId of chunk) {
      const russianName = await fetchWowRoadRussianName(itemId);
      if (russianName) {
        chunkNames[itemId] = russianName;
        chunkResolved += 1;
        progress.record(true);
      } else {
        chunkFailed += 1;
        progress.record(false);
      }
    }

    return { chunkNames, chunkResolved, chunkFailed };
  }

  const chunkResults = await Promise.all(chunks.map((chunk) => processChunk(chunk)));

  const names = {};
  let resolvedCount = 0;
  let failedCount = 0;

  for (const result of chunkResults) {
    Object.assign(names, result.chunkNames);
    resolvedCount += result.chunkResolved;
    failedCount += result.chunkFailed;
  }

  return { names, resolvedCount, failedCount };
}

async function main() {
  const skipRu = process.argv.includes("--skip-ru");
  const dbPath = path.join(rootDir, "scripts/wowsims-db.json");
  const itemLevelsPath = path.join(rootDir, "src/data/wotlk-item-levels.json");
  const namesOutPath = path.join(rootDir, "src/data/wotlk-item-names.json");
  const namesRuOutPath = path.join(rootDir, "src/data/wotlk-item-names-ru.json");
  const gearSlotsOutPath = path.join(rootDir, "src/data/wotlk-item-gear-slots.json");
  const equipPropsOutPath = path.join(rootDir, "src/data/wotlk-item-equip-props.json");
  const itemStatsOutPath = path.join(rootDir, "src/data/wotlk-item-stats.json");
  const lootOutPath = path.join(rootDir, "src/data/raid-loot-by-key.json");
  const dropSourcesOutPath = path.join(rootDir, "src/data/wotlk-item-drop-sources.json");
  const tierSetsOutPath = path.join(rootDir, "src/data/tier-sets-by-item-id.json");

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const itemLevels = JSON.parse(fs.readFileSync(itemLevelsPath, "utf8"));
  const itemLevelIds = Object.keys(itemLevels);

  const names = {
    ...buildItemNames(db.items, itemLevelIds),
    ...TIER_SET_TOKEN_EN_NAMES,
  };
  const gearSlotsByItemId = buildItemGearSlotsMap(db.items, itemLevelIds);
  const equipPropsByItemId = buildItemEquipProps(db.items, itemLevelIds);
  const itemStatsByItemId = buildItemStats(db.items, itemLevelIds);
  const lootByKey = buildRaidLoot(db.items, itemLevelIds);
  const dropSourcesByItemId = buildItemDropSources(db.items, itemLevelIds);
  const tierSetsByItemId = buildTierSetsByItemId(db.items);
  supplementVaultOfArchavonData(
    tierSetsByItemId,
    itemLevelIds,
    lootByKey,
    dropSourcesByItemId,
  );

  fs.writeFileSync(namesOutPath, `${JSON.stringify(names)}\n`);
  fs.writeFileSync(gearSlotsOutPath, `${JSON.stringify(gearSlotsByItemId)}\n`);
  fs.writeFileSync(equipPropsOutPath, `${JSON.stringify(equipPropsByItemId)}\n`);
  fs.writeFileSync(itemStatsOutPath, `${JSON.stringify(itemStatsByItemId)}\n`);
  fs.writeFileSync(lootOutPath, `${JSON.stringify(lootByKey)}\n`);
  fs.writeFileSync(dropSourcesOutPath, `${JSON.stringify(dropSourcesByItemId)}\n`);
  fs.writeFileSync(tierSetsOutPath, `${JSON.stringify(tierSetsByItemId)}\n`);

  const slotCounts = Object.fromEntries(
    Object.entries(lootByKey).map(([raidKey, loot]) => [
      raidKey,
      Object.keys(loot.slots).length,
    ]),
  );

  console.log(`Wrote ${Object.keys(names).length} item names → ${namesOutPath}`);
  console.log(
    `Wrote ${Object.keys(gearSlotsByItemId).length} item gear slots → ${gearSlotsOutPath}`,
  );
  console.log(
    `Wrote ${Object.keys(equipPropsByItemId).length} item equip props → ${equipPropsOutPath}`,
  );
  console.log(
    `Wrote ${Object.keys(itemStatsByItemId).length} item stat bundles → ${itemStatsOutPath}`,
  );
  console.log(`Wrote raid loot for ${Object.keys(lootByKey).length} raids → ${lootOutPath}`);
  console.log("Slots covered per raid:", slotCounts);
  console.log(
    `Wrote ${Object.keys(dropSourcesByItemId).length} item drop sources → ${dropSourcesOutPath}`,
  );
  console.log(
    `Wrote ${Object.keys(tierSetsByItemId).length} tier set pieces → ${tierSetsOutPath}`,
  );

  if (skipRu) {
    console.log("Skipped Russian item names (--skip-ru).");
    return;
  }

  const russianNameIds = [
    ...new Set([...itemLevelIds.map(Number), ...TIER_SET_TOKEN_ITEM_IDS]),
  ];
  console.log(
    `Fetching ${russianNameIds.length} Russian item names from WoWRoad (concurrency ${WOWROAD_FETCH_CONCURRENCY})…`,
  );
  const { names: russianNames, resolvedCount, failedCount } =
    await buildRussianItemNames(russianNameIds);

  fs.writeFileSync(namesRuOutPath, `${JSON.stringify(russianNames)}\n`);
  console.log(
    `Wrote ${Object.keys(russianNames).length} Russian item names (${failedCount} missing) → ${namesRuOutPath}`,
  );
  console.log(`Resolved ${resolvedCount}/${russianNameIds.length} WoWRoad names.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
