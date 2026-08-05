import { RaidTrackerProvider } from "./contexts/raid-tracker-provider.tsx";
import { BisListsProvider } from "./contexts/bis-lists-provider.tsx";
import { ItemTooltipLocaleProvider } from "./contexts/item-tooltip-locale-provider.tsx";
import { WowDataProvider } from "./contexts/wow-data-provider.tsx";
import { TrackerLayout } from "./components/tracker-layout/index.tsx";
import "./App.css";

function App() {
  return (
    <ItemTooltipLocaleProvider>
      <WowDataProvider>
        <RaidTrackerProvider>
          <BisListsProvider>
            <TrackerLayout />
          </BisListsProvider>
        </RaidTrackerProvider>
      </WowDataProvider>
    </ItemTooltipLocaleProvider>
  );
}

export default App;
