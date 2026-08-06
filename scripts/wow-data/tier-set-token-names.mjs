/** Tier set upgrade token item ids + EN names (not in WowSims ilvl bundle). */
export const TIER_SET_TOKEN_EN_NAMES = {
  52025: "Vanquisher's Mark of Sanctification",
  52026: "Protector's Mark of Sanctification",
  52027: "Conqueror's Mark of Sanctification",
  52028: "Vanquisher's Mark of Sanctification (Heroic)",
  52029: "Protector's Mark of Sanctification (Heroic)",
  52030: "Conqueror's Mark of Sanctification (Heroic)",
  47559: "Regalia of the Grand Vanquisher",
  47558: "Regalia of the Grand Protector",
  47557: "Regalia of the Grand Conqueror",
  47554: "Triumph of the Grand Vanquisher",
  47556: "Triumph of the Grand Protector",
  47555: "Triumph of the Grand Conqueror",
};

export const TIER_SET_TOKEN_ITEM_IDS = Object.keys(TIER_SET_TOKEN_EN_NAMES).map(
  Number,
);
