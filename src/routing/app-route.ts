import { useLocation } from "react-router-dom";

export const APP_ROUTES = {
  raids: "/raids",
  characterPick: "/raids/select-character",
  gearPick: "/raids/roll-and-soft",
  bisLists: "/raids/bis-builds",
  addCharacter: "/raids/add-character",
  addRaid: "/raids/add-new-raid",
  raidSettings: "/raids/settings",
  settings: "/settings",
  reputation: "/reputation",
  raidComposition: "/raid-composition",
  profile: "/profile",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES] | "/not-found";

export const RAID_WORKSPACE_ROUTES = [
  APP_ROUTES.raids, APP_ROUTES.characterPick, APP_ROUTES.gearPick,
  APP_ROUTES.bisLists, APP_ROUTES.addCharacter, APP_ROUTES.addRaid, APP_ROUTES.raidSettings,
] as const satisfies readonly AppRoute[];

export function isRaidWorkspaceRoute(route: AppRoute): boolean {
  return RAID_WORKSPACE_ROUTES.some((path) => route === path);
}

export function useAppRoute(): AppRoute {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  if (normalizedPath === "/" || normalizedPath === APP_ROUTES.raids) {
    return APP_ROUTES.raids;
  }
  const knownRoutes: string[] = Object.values(APP_ROUTES);
  return knownRoutes.includes(normalizedPath)
    ? (normalizedPath as AppRoute)
    : "/not-found";
}
