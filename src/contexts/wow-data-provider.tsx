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
  isWowHintDataReady,
} from "../data/ensure-wow-data.ts";
import { useItemTooltipLocale } from "../hooks/use-item-tooltip-locale.ts";
import { WowDataContext, type WowDataContextValue } from "./wow-data-context.ts";

/** Starts deferred WoW JSON loads; exposes readiness for tint gating. */
export function WowDataProvider({ children }: { children: ReactNode }) {
  const { locale } = useItemTooltipLocale();
  const [coreReadyLocale, setCoreReadyLocale] = useState<string | null>(null);
  const [hintReady, setHintReady] = useState(() => isWowHintDataReady());
  const [coreFailedLocale, setCoreFailedLocale] = useState<string | null>(null);
  const [hintFailed, setHintFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setCoreFailedLocale(null);
    setHintFailed(false);
    setAttempt((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void ensureCoreItemDataLoaded(locale).then(() => {
      if (!cancelled) {
        setCoreReadyLocale(locale);
        setCoreFailedLocale(null);
      }
    }, () => {
      if (!cancelled) setCoreFailedLocale(locale);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, attempt]);

  useEffect(() => {
    let cancelled = false;
    void ensureWowHintDataLoaded().then(() => {
      if (!cancelled) {
        setHintReady(true);
        setHintFailed(false);
      }
    }, () => {
      if (!cancelled) setHintFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const value = useMemo<WowDataContextValue>(
    () => ({
      coreReady: coreReadyLocale === locale,
      hintReady,
      failed: coreFailedLocale === locale || hintFailed,
      retry,
    }),
    [coreFailedLocale, coreReadyLocale, hintFailed, hintReady, locale, retry],
  );

  return (
    <WowDataContext.Provider value={value}>{children}</WowDataContext.Provider>
  );
}
