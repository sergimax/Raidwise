import { useSyncExternalStore } from "react";

export const APP_ROUTES = {
  raids: "/raids",
  characterPick: "/raids/select-character",
  gearPick: "/raids/roll-and-soft",
  bisLists: "/raids/bis-builds",
  addCharacter: "/raids/add-character",
  addRaid: "/raids/add-new-raid",
  settings: "/raids/settings",
  changelog: "/changelog",
  reputation: "/reputation",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES] | "/not-found";

const appBasePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const knownRoutes = new Set<string>(Object.values(APP_ROUTES));
const NAVIGATION_EVENT = "raidwise:navigate";

function getRouteFromLocation(): AppRoute {
  const pathname = window.location.pathname;
  const appPath = pathname.startsWith(appBasePath)
    ? pathname.slice(appBasePath.length) || "/"
    : pathname;
  const normalizedPath = appPath.replace(/\/$/, "") || "/";

  if (normalizedPath === "/" || normalizedPath === "/raids") {
    return APP_ROUTES.raids;
  }
  return knownRoutes.has(normalizedPath)
    ? (normalizedPath as AppRoute)
    : "/not-found";
}

function subscribeToRouteChanges(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAVIGATION_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAVIGATION_EVENT, onChange);
  };
}

export function useAppRoute(): AppRoute {
  return useSyncExternalStore(
    subscribeToRouteChanges,
    getRouteFromLocation,
    () => APP_ROUTES.raids,
  );
}

export function getAppHref(route: AppRoute): string {
  return `${appBasePath}${route}`;
}

export function navigateTo(route: AppRoute, replace = false) {
  const destination = getAppHref(route);
  if (window.location.pathname === destination) return;
  if (replace) {
    window.history.replaceState(null, "", destination);
  } else {
    window.history.pushState(null, "", destination);
  }
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}
