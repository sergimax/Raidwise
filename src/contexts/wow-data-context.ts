import { createContext } from "react";

export type WowDataContextValue = {
  /** Active-locale names + item levels ready for links. */
  coreReady: boolean;
  /** Stats / equip / drops / variants ready for gear-hint tints. */
  hintReady: boolean;
};

export const WowDataContext = createContext<WowDataContextValue>({
  coreReady: false,
  hintReady: false,
});
