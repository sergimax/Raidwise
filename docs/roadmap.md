# Roadmap & feature ideas

Ideas for future releases. Not committed to a version or timeline.

## Gear upgrade hints

### Stat-aware class + spec recommendations — **shipped (v1.29.0, ilvl track)**

Ilvl hints filter raid loot using GearScore2-inspired compatibility rules and per-spec PvE stat weights (`spec-stat-priorities.ts`, `item-stat-fit.ts`, `wotlk-item-stats.json`; weights from [gearscore2](https://github.com/cozawariat/gearscore2)). BiS-list hints (amber) are unchanged. Agi+AP cross-armor pieces still pass for Strength melee specs (Ret/Fury/DK) via AP weighting; Enhancement accepts both Agi and spellhance Int gear; pure caster/healer items fail for physical DPS (e.g. int plate for Fury). Neutral gear (stamina, armor, resistances only) still passes. Same-release extras: BiS normal/heroic name variants, amber/blue toggle tints, compact three-tier gear hint tooltip.

**Possible follow-ups:** finer per-spec tuning, trinket proc awareness, stat-aware BiS slot validation.

---

## BiS lists

### Also owned gear — **shipped (v1.53.0)**

Character edit lists item ids available but not on the WowSims export (bags / other spec / vendors). Shared across main and off; counts toward BiS/ilvl/tier-token hints and Soft pick (`alsoOwnedItemIds`, `schemaVersion` 6).

### BiS list copy — **shipped (v1.53.0)**

Copy button on the BiS panel exports the currently shown list as pasteable `Slot: Item` lines (`formatBisListCopyText`).

**Possible follow-ups:** mark owned items from BiS panel / gear-hint tooltips; soft-reserve ownership separate from also-owned.

---

## Other ideas

_Add new sections here as ideas come up._
