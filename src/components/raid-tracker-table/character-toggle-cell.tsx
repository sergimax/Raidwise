import { Switch, TableCell, Tooltip, Box } from "@mui/material";
import { useCallback, useMemo, useState, memo } from "react";
import type { AppLocale } from "../../i18n/types.ts";
import type { CharacterRecord } from "../../types/characters.ts";
import type { DungeonRecord, DungeonToggles } from "../../types/dungeons.ts";
import type { GetBisSlotMapForSpec } from "../../utils/bis-lists.ts";
import { isCooldownOn } from "../../utils/dungeon-toggles.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { getLocalizedDungeonDisplayName } from "../../i18n/localized-domain.ts";
import { formatCharacterDisplayName } from "../../utils/character-display.ts";
import { useWowDataReady } from "../../hooks/use-wow-data-ready.ts";
import {
  evaluateCharacterGearHintsFromTints,
  evaluateCharacterGearHintTints,
  hasAnyGearHint,
} from "../../utils/character-gear-hints.ts";
import {
  collectMissingBisLootItemIds,
  collectMissingIlvlLootItemIds,
  type GearUpgradeHint,
} from "../../utils/gear-upgrade-hint.ts";
import {
  gearUpgradeHintBandsCellSx,
} from "../../utils/gear-hint-display.ts";
import { GearHintTooltipContent } from "../gear-hint-tooltip/index.tsx";
import { CHARACTER_BODY_CELL_SX } from "./table-layout.ts";

function GearItemCounts({ hint, side }: {
  hint?: GearUpgradeHint;
  side: "left" | "right";
}) {
  const { t } = useTranslation();
  if (!hint) return <Box component="span" />;

  const bis = collectMissingBisLootItemIds(hint);
  const counts = [
    { kind: "bis" as const, count: new Set([...bis.exact, ...bis.variant]).size },
    { kind: "ilvl" as const, count: collectMissingIlvlLootItemIds(hint).length },
  ].filter(({ count }) => count > 0);

  return (
    <Box component="span" sx={{
      position: "absolute",
      insetBlock: 0,
      left: side === "left" ? 0 : "50%",
      width: "50%",
      display: "grid",
      gridTemplateRows: "repeat(2, 1fr)",
      pointerEvents: "none",
    }}>
      {counts.map(({ kind, count }) => (
        <Box
          component="span"
          key={kind}
          aria-label={`${t(kind === "bis" ? "gearHint.kindLabelBis" : "gearHint.kindLabelUpgrades")}: ${count}`}
          sx={{
            gridRow: kind === "bis" ? 1 : 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            opacity: 0.4,
            fontSize: 13,
            lineHeight: 1.2,
            fontWeight: 400,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          х{count}
        </Box>
      ))}
    </Box>
  );
}

type CharacterToggleCellProps = {
  character: CharacterRecord;
  dungeon: DungeonRecord;
  dungeonToggles: DungeonToggles;
  onDungeonToggle: (characterId: string, dungeonId: string) => void;
  locale: AppLocale;
  getBisSlotMapForSpec: GetBisSlotMapForSpec;
};

function areCharacterToggleCellPropsEqual(
  previous: CharacterToggleCellProps,
  next: CharacterToggleCellProps,
): boolean {
  if (previous.character !== next.character) {
    return false;
  }
  if (previous.dungeon !== next.dungeon) {
    return false;
  }
  if (previous.onDungeonToggle !== next.onDungeonToggle) {
    return false;
  }
  if (previous.locale !== next.locale) {
    return false;
  }
  if (previous.getBisSlotMapForSpec !== next.getBisSlotMapForSpec) {
    return false;
  }
  const characterId = previous.character.id;
  const dungeonId = previous.dungeon.id;
  return (
    isCooldownOn(previous.dungeonToggles, characterId, dungeonId) ===
    isCooldownOn(next.dungeonToggles, characterId, dungeonId)
  );
}

export const CharacterToggleCell = memo(function CharacterToggleCell({
  character,
  dungeon,
  dungeonToggles,
  onDungeonToggle,
  locale,
  getBisSlotMapForSpec,
}: CharacterToggleCellProps) {
  const { t } = useTranslation();
  const { hintReady } = useWowDataReady();

  const gearHintTints = useMemo(
    () =>
      hintReady
        ? evaluateCharacterGearHintTints(
            character,
            dungeon,
            getBisSlotMapForSpec,
          )
        : {},
    [character, dungeon, getBisSlotMapForSpec, hintReady],
  );

  const isDungeonMarkedComplete = isCooldownOn(
    dungeonToggles,
    character.id,
    dungeon.id,
  );

  const hasGearHints = hasAnyGearHint(gearHintTints);
  const dungeonDisplayName = getLocalizedDungeonDisplayName(dungeon, locale, false);

  const hasDualSpecGear = Boolean(character.mainSpec && character.offSpec);
  const cellHintSx = useMemo(
    () => isDungeonMarkedComplete ? {} : gearUpgradeHintBandsCellSx(
      gearHintTints.main?.gearHint,
      gearHintTints.off?.gearHint,
      dungeon.itemLevel,
      hasDualSpecGear,
    ),
    [gearHintTints, dungeon.itemLevel, hasDualSpecGear, isDungeonMarkedComplete],
  );

  const [gearHintTooltipOpen, setGearHintTooltipOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setGearHintTooltipOpen(false);
    onDungeonToggle(character.id, dungeon.id);
  }, [character.id, dungeon.id, onDungeonToggle]);

  const handleGearHintTooltipOpen = useCallback(() => {
    if (!isDungeonMarkedComplete) {
      setGearHintTooltipOpen(true);
    }
  }, [isDungeonMarkedComplete]);

  const handleGearHintTooltipClose = useCallback(() => {
    setGearHintTooltipOpen(false);
  }, []);

  const tooltipTitle = useMemo(() => {
    if (!gearHintTooltipOpen || isDungeonMarkedComplete) {
      return null;
    }

    const gearHints = evaluateCharacterGearHintsFromTints(
      gearHintTints,
      dungeon,
      locale,
    );

    return (
      <GearHintTooltipContent
        gearHints={gearHints}
        characterClassName={character.class?.name}
        locale={locale}
        t={t}
      />
    );
  }, [
    character.class?.name,
    dungeon,
    gearHintTints,
    gearHintTooltipOpen,
    isDungeonMarkedComplete,
    locale,
    t,
  ]);

  const toggleSwitch = (
    <Switch
      size="small"
      checked={isDungeonMarkedComplete}
      onChange={handleToggle}
      slotProps={{
        input: {
          "aria-label": t("table.toggleAria", {
            character: formatCharacterDisplayName(character.name),
            dungeon: dungeonDisplayName,
          }),
        },
      }}
    />
  );

  const toggleWithCounts = (
    <Box component="span" sx={{
      position: "relative",
      minHeight: 36,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    }}>
      <GearItemCounts
        side="left"
        hint={isDungeonMarkedComplete ? undefined : gearHintTints.main?.gearHint}
      />
      {toggleSwitch}
      <GearItemCounts
        side="right"
        hint={isDungeonMarkedComplete ? undefined : gearHintTints.off?.gearHint}
      />
    </Box>
  );

  return (
    <TableCell
      className="raid-tracker-table__toggle-cell"
      align="center"
      sx={[
        CHARACTER_BODY_CELL_SX,
        hasGearHints && {
          transition: (theme) =>
            theme.transitions.create(["background", "background-color"], {
              duration: theme.transitions.duration.shortest,
            }),
        },
        cellHintSx,
      ]}
    >
      <Box
        component="span"
        sx={{ position: "relative", zIndex: 1, display: "inline-flex", width: "100%" }}
      >
        {hasGearHints ? (
          <Tooltip
            open={!isDungeonMarkedComplete && gearHintTooltipOpen}
            onOpen={handleGearHintTooltipOpen}
            onClose={handleGearHintTooltipClose}
            disableInteractive={false}
            slotProps={{
              tooltip: {
                sx: { maxWidth: "none", p: 1 },
              },
            }}
            title={tooltipTitle ?? ""}
          >
            <Box component="span" sx={{ width: "100%" }}>{toggleWithCounts}</Box>
          </Tooltip>
        ) : (
          toggleWithCounts
        )}
      </Box>
    </TableCell>
  );
}, areCharacterToggleCellPropsEqual);
