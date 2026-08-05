import { Box, Chip, Stack, Typography } from "@mui/material";
import type { AppLocale } from "../../i18n/types.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import type { DungeonRecord } from "../../types/dungeons.ts";
import { getRaidIcon } from "../../assets/raid-icons/raid-icons.ts";
import { resolveDungeonRaidKey } from "../../utils/resolve-dungeon-raid-key.ts";
import { formatDungeonExportLabel } from "../../utils/format-dungeon-label.ts";
import { DungeonNameSearchField } from "../dungeon-name-search-field/index.tsx";
import { ExportRaidIcon } from "./export-raid-icon.tsx";

type ExportDungeonFilterProps = {
  dungeonNameSearch: string;
  onDungeonNameSearchChange: (query: string) => void;
  visibleDungeons: readonly DungeonRecord[];
  excludedDungeonIds: ReadonlySet<string>;
  onToggleDungeonExcluded: (dungeonId: string) => void;
  totalDungeonCount: number;
  locale: AppLocale;
  t: TranslateFn;
};

export function ExportDungeonFilter({
  dungeonNameSearch,
  onDungeonNameSearchChange,
  visibleDungeons,
  excludedDungeonIds,
  onToggleDungeonExcluded,
  totalDungeonCount,
  locale,
  t,
}: ExportDungeonFilterProps) {
  const selectedCount = visibleDungeons.reduce(
    (count, dungeon) =>
      excludedDungeonIds.has(dungeon.id) ? count : count + 1,
    0,
  );

  return (
    <Stack spacing={0.75} sx={{ flex: 1, minHeight: 0, height: "100%" }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            flex: "1 1 12rem",
            maxWidth: 280,
            minWidth: 0,
          }}
        >
          <DungeonNameSearchField
            value={dungeonNameSearch}
            onChange={onDungeonNameSearchChange}
          />
        </Box>
        <Typography
          variant="body2"
          sx={{ flexShrink: 0, lineHeight: 1.35, whiteSpace: "nowrap" }}
        >
          {t("exportPanel.dungeonFilterMatchCount", {
            selected: selectedCount,
            matched: visibleDungeons.length,
            total: totalDungeonCount,
          })}
        </Typography>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {visibleDungeons.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("exportPanel.dungeonFilterNoMatches")}
          </Typography>
        ) : (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ flexWrap: "wrap", gap: 0.75 }}
          >
            {visibleDungeons.map((dungeon) => {
              const raidKey = resolveDungeonRaidKey(dungeon);
              const raidIcon = getRaidIcon(raidKey);
              const isActive = !excludedDungeonIds.has(dungeon.id);
              const label = formatDungeonExportLabel(dungeon, locale);

              return (
                <Chip
                  key={dungeon.id}
                  size="small"
                  clickable
                  variant="outlined"
                  aria-pressed={isActive}
                  aria-label={
                    isActive
                      ? t("exportPanel.dungeonChipExcludeAria", { raid: label })
                      : t("exportPanel.dungeonChipIncludeAria", { raid: label })
                  }
                  onClick={() => onToggleDungeonExcluded(dungeon.id)}
                  sx={{
                    opacity: isActive ? 1 : 0.55,
                    bgcolor: isActive
                      ? "var(--brand-soft)"
                      : "transparent",
                    borderColor: isActive
                      ? "color-mix(in srgb, var(--brand) 45%, transparent)"
                      : "divider",
                    color: isActive ? "var(--brand)" : "text.secondary",
                    "& .MuiChip-label": {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      lineHeight: 1,
                      py: 0,
                    },
                  }}
                  label={
                    <>
                      {raidIcon ? (
                        <ExportRaidIcon raidKey={raidKey} size={14} />
                      ) : null}
                      <Box component="span" sx={{ lineHeight: 1 }}>
                        {label}
                      </Box>
                    </>
                  }
                />
              );
            })}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
