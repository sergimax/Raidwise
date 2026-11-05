import { lazy } from "react";
import { useRaidTrackerContext } from "../../hooks/use-raid-tracker-context.ts";
import {
  useBisListsSession,
  useCharacterPickSession,
  useGearPickSession,
  useRaidTableSession,
} from "../../hooks/use-raid-workspace-sessions.ts";
import { ResetParametersActions } from "../filter-unit/reset-parameters-actions.tsx";
import { RaidTrackerTable, type RaidTrackerTableProps } from "../raid-tracker-table/index.tsx";

import { loadRouteModule } from "../../routing/load-route-module.ts";

const BisListsPanel = lazy(() => loadRouteModule(async () => ({ default: (await import("../bis-lists-panel/index.tsx")).BisListsPanel })));
const CharacterPickPanel = lazy(() => loadRouteModule(async () => ({ default: (await import("../character-pick-panel/index.tsx")).CharacterPickPanel })));
const GearPickPanel = lazy(() => loadRouteModule(async () => ({ default: (await import("../gear-pick-panel/index.tsx")).GearPickPanel })));

function useRaidSelection() {
  const { characters, dungeonToggles } = useRaidTrackerContext();
  const { sortedDungeons, dungeonNameSearch, setDungeonNameSearch, dungeonCount } = useRaidTableSession();
  return {
    characters,
    dungeonToggles,
    dungeonNameSearch,
    onDungeonNameSearchChange: setDungeonNameSearch,
    visibleDungeons: sortedDungeons,
    totalDungeonCount: dungeonCount,
  };
}

export function WorkspaceCharacterPick() {
  const selection = useRaidSelection();
  const session = useCharacterPickSession();
  return <CharacterPickPanel {...selection} session={session} />;
}

export function WorkspaceGearPick() {
  const selection = useRaidSelection();
  const session = useGearPickSession();
  return <GearPickPanel {...selection} session={session} />;
}

export function WorkspaceBisLists() {
  const session = useBisListsSession();
  return <BisListsPanel session={session} />;
}

export function WorkspaceRaidTable(props: Omit<RaidTrackerTableProps, "tableState">) {
  const tableState = useRaidTableSession();
  return <RaidTrackerTable {...props} tableState={tableState} />;
}

function ResetWorkspaceFilters({ reset }: { reset: () => void }) {
  const { setDungeonNameSearch } = useRaidTableSession();
  return <ResetParametersActions onResetParameters={() => {
    reset();
    setDungeonNameSearch("");
  }} />;
}

export function ResetCharacterPickFilters() {
  const { resetAllFilters } = useCharacterPickSession();
  return <ResetWorkspaceFilters reset={resetAllFilters} />;
}

export function ResetGearPickFilters() {
  const { resetAllFilters } = useGearPickSession();
  return <ResetWorkspaceFilters reset={resetAllFilters} />;
}
