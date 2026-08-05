import { buildItemIdMap } from "./build-item-id-map.ts";
import { createLazyJsonLoader } from "./lazy-json.ts";

/** Compact WowSims item fields used for class/spec equip checks (from build:wow-data). */
export type WotlkItemEquipProps = {
  /** ItemType */
  t: number;
  /** ArmorType */
  a?: number;
  /** WeaponType */
  w?: number;
  /** HandType */
  h?: number;
  /** RangedWeaponType */
  r?: number;
  /** WowSims Class enum values */
  c?: readonly number[];
};

let equipPropsByItemId = new Map<number, WotlkItemEquipProps>();

export const ensureWotlkItemEquipPropsLoaded = createLazyJsonLoader(
  () => import("./wotlk-item-equip-props.json"),
  (data) => {
    equipPropsByItemId = buildItemIdMap(
      data as Record<string, WotlkItemEquipProps>,
    );
  },
);

export function getWotlkItemEquipProps(itemId: number): WotlkItemEquipProps | undefined {
  return equipPropsByItemId.get(itemId);
}
