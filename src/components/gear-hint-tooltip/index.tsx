import {
  Box,
  Typography,
} from "@mui/material";
import type { ItemTooltipLocale } from "../../constants/item-tooltips.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import type { ClassName } from "../../types/characters.ts";
import { SpecOptionLabel } from "../spec-option-label/index.tsx";
import { WowItemAlternatives, WowItemLink } from "../wow-item-link/index.tsx";
import { getGearHintKindColor } from "../../utils/gear-hint-display.ts";
import {
  formatGearUpgradeHintTooltip,
  type GearHintCellDisplay,
} from "../../utils/gear-upgrade-hint.ts";
import {
  aggregateTierSetTokenNeeds,
  type AggregatedTierSetTokenNeed,
} from "../../utils/tier-set-hint.ts";
import type { CharacterGearHints, SpecGearHint } from "../../utils/character-gear-hints.ts";
import type { BossBisLootGroup } from "../../utils/item-drop-sources.ts";
import {
  getTooltipSurface,
  TOOLTIP_ITEM_LINK_COLOR_MODE,
} from "../../theme/tooltip-surface.ts";

/** Scroll when boss-grouped BiS loot exceeds this height (tooltip stays scannable). */
const BIS_LOOT_LIST_MAX_HEIGHT = 128;

type GearHintTooltipContentProps = {
  gearHints: CharacterGearHints;
  characterClassName?: ClassName;
  locale: ItemTooltipLocale;
  t: TranslateFn;
};

function GearHintSectionTitle({
  hintKind,
  titleKey,
  count,
  t,
}: {
  hintKind: GearHintCellDisplay["kind"];
  titleKey:
    | "gearHint.bisBossLoot"
    | "gearHint.bisVariantBossLoot"
    | "gearHint.ilvlBossLoot";
  count: number;
  t: TranslateFn;
}) {
  const kindLabelKey =
    hintKind === "bis" ? "gearHint.kindLabelBis" : "gearHint.kindLabelUpgrades";

  return (
    <Typography
      variant="caption"
      component="p"
      sx={{
        fontWeight: 600,
        mb: 0.25,
        lineHeight: 1.25,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={(theme) => ({
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: getGearHintKindColor(hintKind, theme),
        })}
      />
      <Box component="span" sx={{ fontWeight: 700 }}>
        {t(kindLabelKey)}
      </Box>
      <Box
        component="span"
        sx={(theme) => ({ color: getTooltipSurface(theme.palette.mode).mutedColor })}
        aria-hidden
      >
        ·
      </Box>
      <Box
        component="span"
        sx={(theme) => ({ color: getTooltipSurface(theme.palette.mode).mutedColor })}
      >
        {t(titleKey)} ({count})
      </Box>
    </Typography>
  );
}

function BisBossLootSection({
  hintKind,
  titleKey,
  groups,
  marginBottom,
  t,
}: {
  hintKind: GearHintCellDisplay["kind"];
  titleKey:
    | "gearHint.bisBossLoot"
    | "gearHint.bisVariantBossLoot"
    | "gearHint.ilvlBossLoot";
  groups: readonly BossBisLootGroup[];
  marginBottom: number;
  t: TranslateFn;
}) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: marginBottom }}>
      <GearHintSectionTitle
        hintKind={hintKind}
        titleKey={titleKey}
        count={new Set(groups.flatMap((group) => group.itemIds)).size}
        t={t}
      />
      <Box
        sx={{
          maxHeight: BIS_LOOT_LIST_MAX_HEIGHT,
          overflowY: "auto",
          pr: 0.25,
          scrollbarWidth: "thin",
        }}
      >
        {groups.map((group) => (
          <Typography
            key={group.bossName || group.itemIds.join(",")}
            variant="caption"
            component="div"
            sx={{
              lineHeight: 1.25,
              mb: 0.25,
              "&:last-child": { mb: 0 },
            }}
          >
            {group.bossName ? (
              <Box component="span" sx={{ fontWeight: 600 }}>
                {group.bossName}
                {": "}
              </Box>
            ) : null}
            <WowItemAlternatives
              itemIds={group.itemIds}
              linkColorMode={TOOLTIP_ITEM_LINK_COLOR_MODE}
            />
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

function TierSetTokenSection({
  tokenRows,
  marginBottom,
  t,
}: {
  tokenRows: readonly AggregatedTierSetTokenNeed[];
  marginBottom: number;
  t: TranslateFn;
}) {
  if (tokenRows.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: marginBottom }}>
      <Typography
        variant="caption"
        component="p"
        sx={{ fontWeight: 600, mb: 0.25, lineHeight: 1.25 }}
      >
        {t("tierSet.tokensFromRaid")}
      </Typography>
      {tokenRows.map((row) => (
        <Typography
          key={row.tokenItemId}
          variant="caption"
          component="p"
          sx={{ lineHeight: 1.25, mb: 0.25, "&:last-child": { mb: 0 } }}
        >
          <WowItemLink
            itemId={row.tokenItemId}
            linkColorMode={TOOLTIP_ITEM_LINK_COLOR_MODE}
          />
          {row.count > 1 ? ` ×${row.count}` : null}
        </Typography>
      ))}
    </Box>
  );
}

function SpecGearHintSection({
  specHint,
  characterClassName,
  t,
}: {
  specHint: SpecGearHint;
  characterClassName?: ClassName;
  t: TranslateFn;
}) {
  const specName = specHint.specGear.spec;
  const hasBisLootList = specHint.bisBossLootGroups.length > 0;
  const hasBisVariantList = specHint.bisVariantBossLootGroups.length > 0;
  const hasIlvlLootList = specHint.ilvlBossLootGroups.length > 0;

  const gearSummary = formatGearUpgradeHintTooltip(specHint.gearHint, t, {
    showIlvlBossLoot: hasIlvlLootList,
  });
  const tokenRows = aggregateTierSetTokenNeeds(specHint.tierSetHint.tokenNeeds);

  if (
    !gearSummary &&
    tokenRows.length === 0 &&
    !hasBisLootList &&
    !hasBisVariantList &&
    !hasIlvlLootList
  ) {
    return null;
  }

  const sectionMarginBelowLootLists = tokenRows.length > 0 ? 1 : 0;

  return (
    <Box sx={{ mb: 1, "&:last-child": { mb: 0 } }}>
      {characterClassName !== undefined ? (
        <Box
          sx={{
            mb: 0.5,
            "& .MuiTypography-root": { fontWeight: 600, color: "inherit" },
          }}
        >
          <SpecOptionLabel
            className={characterClassName}
            spec={specName}
            gearScore={specHint.specGear.gearScore}
            iconSize={16}
            variant="caption"
            color="inherit"
          />
        </Box>
      ) : (
        <Typography variant="caption" component="p" sx={{ fontWeight: 600, mb: 0.5 }}>
          {specName}
        </Typography>
      )}
      {gearSummary ? (
        <Typography
          variant="caption"
          component="p"
          sx={{
            mb:
              hasBisLootList ||
              hasBisVariantList ||
              hasIlvlLootList ||
              tokenRows.length > 0
                ? 1
                : 0,
            whiteSpace: "pre-line",
          }}
        >
          {gearSummary}
        </Typography>
      ) : null}

      <BisBossLootSection
        hintKind="bis"
        titleKey="gearHint.bisBossLoot"
        groups={specHint.bisBossLootGroups}
        marginBottom={hasBisVariantList ? 1 : sectionMarginBelowLootLists}
        t={t}
      />

      <BisBossLootSection
        hintKind="bis"
        titleKey="gearHint.bisVariantBossLoot"
        groups={specHint.bisVariantBossLootGroups}
        marginBottom={hasIlvlLootList ? 1 : sectionMarginBelowLootLists}
        t={t}
      />

      <BisBossLootSection
        hintKind="ilvl"
        titleKey="gearHint.ilvlBossLoot"
        groups={specHint.ilvlBossLootGroups}
        marginBottom={sectionMarginBelowLootLists}
        t={t}
      />

      <TierSetTokenSection
        tokenRows={tokenRows}
        marginBottom={0}
        t={t}
      />
    </Box>
  );
}

export function GearHintTooltipContent({
  gearHints,
  characterClassName,
  locale,
  t,
}: GearHintTooltipContentProps) {
  const sections = [gearHints.main, gearHints.off].filter(
    (specHint): specHint is SpecGearHint => specHint !== undefined,
  );

  if (sections.length === 0) {
    return null;
  }

  return (
    <Box key={locale} sx={{ maxWidth: 400 }}>
      {sections.map((specHint) => (
        <SpecGearHintSection
          key={specHint.specGear.spec}
          specHint={specHint}
          characterClassName={characterClassName}
          t={t}
        />
      ))}
    </Box>
  );
}
