import { RaidTrackerProvider } from "./contexts/raid-tracker-provider.tsx";
import { BisListsProvider } from "./contexts/bis-lists-provider.tsx";
import { ItemTooltipLocaleProvider } from "./contexts/item-tooltip-locale-provider.tsx";
import { WowDataProvider } from "./contexts/wow-data-provider.tsx";
import { RaidWorkspaceSessionProvider } from "./contexts/raid-workspace-session-provider.tsx";
import { AppRouteContent } from "./components/app-route-content/index.tsx";
import { WowDataNotice } from "./components/wow-data-notice/index.tsx";
import { BrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { useRaidTrackerContext } from "./hooks/use-raid-tracker-context.ts";
import { APP_ROUTES, isRaidWorkspaceRoute, useAppRoute } from "./routing/app-route.ts";
import "./App.css";

function WorkspaceWowData({ children }: { children: ReactNode }) {
  const route = useAppRoute();
  const { characters, dungeons } = useRaidTrackerContext();
  // Prefetch for visible table cells and request data directly on tool URLs.
  const needsHints = route === APP_ROUTES.characterPick || route === APP_ROUTES.gearPick ||
    route === APP_ROUTES.bisLists || (characters.length > 0 && dungeons.length > 0);
  const needsCore = characters.length > 0 || route === APP_ROUTES.addCharacter;
  const demand = !isRaidWorkspaceRoute(route) ? "none" : needsHints ? "hints" : needsCore ? "core" : "none";
  return <WowDataProvider demand={demand}>{children}</WowDataProvider>;
}

function App() {
  return (
    <ItemTooltipLocaleProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <RaidTrackerProvider>
          <WorkspaceWowData>
            <BisListsProvider>
              <RaidWorkspaceSessionProvider>
                <WowDataNotice />
                <AppRouteContent />
              </RaidWorkspaceSessionProvider>
            </BisListsProvider>
          </WorkspaceWowData>
        </RaidTrackerProvider>
      </BrowserRouter>
    </ItemTooltipLocaleProvider>
  );
}

export default App;
