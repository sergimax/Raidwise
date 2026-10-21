import { RaidTrackerProvider } from "./contexts/raid-tracker-provider.tsx";
import { BisListsProvider } from "./contexts/bis-lists-provider.tsx";
import { ItemTooltipLocaleProvider } from "./contexts/item-tooltip-locale-provider.tsx";
import { WowDataProvider } from "./contexts/wow-data-provider.tsx";
import { RaidWorkspaceSessionProvider } from "./contexts/raid-workspace-session-provider.tsx";
import { AppRouteContent } from "./components/app-route-content/index.tsx";
import { BrowserRouter } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <ItemTooltipLocaleProvider>
      <WowDataProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <RaidTrackerProvider>
            <BisListsProvider>
              <RaidWorkspaceSessionProvider>
                <AppRouteContent />
              </RaidWorkspaceSessionProvider>
            </BisListsProvider>
          </RaidTrackerProvider>
        </BrowserRouter>
      </WowDataProvider>
    </ItemTooltipLocaleProvider>
  );
}

export default App;
