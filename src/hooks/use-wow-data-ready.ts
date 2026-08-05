import { useContext } from "react";
import {
  WowDataContext,
  type WowDataContextValue,
} from "../contexts/wow-data-context.ts";

export function useWowDataReady(): WowDataContextValue {
  return useContext(WowDataContext);
}
