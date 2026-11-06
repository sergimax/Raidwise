import { createContext } from "react";

export type WowDataStatus = "loading" | "ready" | "failed" | "missing";

export type WowDataContextValue = {
  /** Active-locale names and item levels. */
  coreStatus: WowDataStatus;
  /** Stats, equipment, drops, and variant indexes. */
  hintStatus: WowDataStatus;
  retry?: () => void;
};

export const WowDataContext = createContext<WowDataContextValue>({
  coreStatus: "loading",
  hintStatus: "loading",
});
