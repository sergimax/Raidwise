import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ensureCoreItemDataLoaded,
  ensureWowHintDataLoaded,
  isWowHintDataReady,
} from "../data/ensure-wow-data.ts";
import { useItemTooltipLocale } from "../hooks/use-item-tooltip-locale.ts";
import { WowDataContext, type WowDataContextValue } from "./wow-data-context.ts";

/** Starts deferred WoW JSON loads; exposes readiness for tint gating. */
export function WowDataProvider({ children }: { children: ReactNode }) {
  const { locale } = useItemTooltipLocale();
  const [coreReadyLocale, setCoreReadyLocale] = useState<string | null>(null);
  const [hintReady, setHintReady] = useState(() => isWowHintDataReady());

  useEffect(() => {
    let cancelled = false;
    void ensureCoreItemDataLoaded(locale).then(() => {
      if (!cancelled) {
        setCoreReadyLocale(locale);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    void ensureWowHintDataLoaded().then(() => {
      if (!cancelled) {
        setHintReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<WowDataContextValue>(
    () => ({
      coreReady: coreReadyLocale === locale,
      hintReady,
    }),
    [coreReadyLocale, hintReady, locale],
  );

  return (
    <WowDataContext.Provider value={value}>{children}</WowDataContext.Provider>
  );
}
