import { useLocation } from "react-router-dom";

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

export function useAppRoute(): AppRoute {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  if (normalizedPath === "/" || normalizedPath === APP_ROUTES.raids) {
    return APP_ROUTES.raids;
  }
  const knownRoutes: string[] = Object.values(APP_ROUTES);
  return knownRoutes.includes(normalizedPath)
    ? (normalizedPath as AppRoute)
    : "/not-found";
}
