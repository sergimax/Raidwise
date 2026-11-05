import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ensureCoreItemDataLoaded,
  ensureWowHintDataLoaded,
  isCoreItemDataReady,
  isWowHintDataReady,
} from "../data/ensure-wow-data.ts";
import { MissingWowDataAssetError } from "../data/lazy-json.ts";
import type { ItemTooltipLocale } from "../constants/item-tooltips.ts";
import { useItemTooltipLocale } from "../hooks/use-item-tooltip-locale.ts";
import { WowDataContext, type WowDataContextValue, type WowDataStatus } from "./wow-data-context.ts";

type Result = { attempt: number; status: Exclude<WowDataStatus, "loading"> };

function failureStatus(error: unknown): "missing" | "failed" {
  return error instanceof MissingWowDataAssetError ? "missing" : "failed";
}

/** Starts deferred WoW JSON loads; exposes readiness for tint gating. */
export function WowDataProvider({ children }: { children: ReactNode }) {
  const { locale } = useItemTooltipLocale();
  const [core, setCore] = useState<(Result & { locale: ItemTooltipLocale }) | null>(null);
  const [hint, setHint] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setAttempt((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void ensureCoreItemDataLoaded(locale).then(() => {
      if (!cancelled) setCore({ locale, attempt, status: "ready" });
    }, (error: unknown) => {
      if (!cancelled) setCore({ locale, attempt, status: failureStatus(error) });
    });
    return () => {
      cancelled = true;
    };
  }, [locale, attempt]);

  useEffect(() => {
    let cancelled = false;
    void ensureWowHintDataLoaded().then(() => {
      if (!cancelled) setHint({ attempt, status: "ready" });
    }, (error: unknown) => {
      if (!cancelled) setHint({ attempt, status: failureStatus(error) });
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const coreStatus = isCoreItemDataReady(locale)
    ? "ready"
    : core?.locale === locale && core.attempt === attempt ? core.status : "loading";
  const hintStatus = isWowHintDataReady() ? "ready" : hint?.attempt === attempt ? hint.status : "loading";
  const value = useMemo<WowDataContextValue>(
    () => ({ coreStatus, hintStatus, retry }),
    [coreStatus, hintStatus, retry],
  );

  return (
    <WowDataContext.Provider value={value}>{children}</WowDataContext.Provider>
  );
}
