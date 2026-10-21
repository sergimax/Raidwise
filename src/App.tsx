import { RaidTrackerProvider } from "./contexts/raid-tracker-provider.tsx";
import { BisListsProvider } from "./contexts/bis-lists-provider.tsx";
import { ItemTooltipLocaleProvider } from "./contexts/item-tooltip-locale-provider.tsx";
import { WowDataProvider } from "./contexts/wow-data-provider.tsx";
import { RaidWorkspaceSessionProvider } from "./contexts/raid-workspace-session-provider.tsx";
import { AppRouteContent } from "./components/app-route-content/index.tsx";
import "./App.css";

function App() {
  return (
    <ItemTooltipLocaleProvider>
      <WowDataProvider>
        <RaidTrackerProvider>
          <BisListsProvider>
            <RaidWorkspaceSessionProvider>
              <AppRouteContent />
            </RaidWorkspaceSessionProvider>
          </BisListsProvider>
        </RaidTrackerProvider>
      </WowDataProvider>
    </ItemTooltipLocaleProvider>
  );
}

export default App;
