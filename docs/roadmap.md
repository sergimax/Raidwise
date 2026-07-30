# Roadmap & feature ideas

Ideas for future releases. Not committed to a version or timeline.

## Gear upgrade hints

### Stat-aware class + spec recommendations — **shipped (v1.29.0, ilvl track)**

Ilvl hints filter raid loot using GearScore2-inspired compatibility rules and per-spec PvE stat weights (`spec-stat-priorities.ts`, `item-stat-fit.ts`, `wotlk-item-stats.json`; weights from [gearscore2](https://github.com/cozawariat/gearscore2)). BiS-list hints (amber) are unchanged. Agi+AP cross-armor pieces still pass for Strength melee specs (Ret/Fury/DK) via AP weighting; Enhancement accepts both Agi and spellhance Int gear; pure caster/healer items fail for physical DPS (e.g. int plate for Fury). Neutral gear (stamina, armor, resistances only) still passes. Same-release extras: BiS normal/heroic name variants, amber/blue toggle tints, compact three-tier gear hint tooltip.

**Possible follow-ups:** finer per-spec tuning, trinket proc awareness, stat-aware BiS slot validation.

---

## BiS lists

- Mark items that are available (owned / softed) but not currently on the WowSims export gear list.
- COPY / export button for the currently selected BiS list (pasteable item lines).

---

## Other ideas

_Add new sections here as ideas come up._
