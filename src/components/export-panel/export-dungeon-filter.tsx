import { Box, Chip, Stack, Typography } from "@mui/material";
import type { AppLocale } from "../../i18n/types.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import type { DungeonRecord } from "../../types/dungeons.ts";
import { getRaidIcon } from "../../assets/raid-icons/raid-icons.ts";
import { resolveDungeonRaidKey } from "../../utils/resolve-dungeon-raid-key.ts";
import { formatDungeonExportLabel } from "../../utils/format-dungeon-label.ts";
import { DungeonNameSearchField } from "../dungeon-name-search-field/index.tsx";
import { ExportRaidIcon } from "./export-raid-icon.tsx";

/** Keeps search + match count pinned; only raid chips scroll inside the section. */
export const exportDungeonFilterContentSx = {
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
} as const;

type ExportDungeonFilterProps = {
  dungeonNameSearch: string;
  onDungeonNameSearchChange: (query: string) => void;
  visibleDungeons: readonly DungeonRecord[];
  totalDungeonCount: number;
  locale: AppLocale;
  t: TranslateFn;
};

export function ExportDungeonFilter({
  dungeonNameSearch,
  onDungeonNameSearchChange,
  visibleDungeons,
  totalDungeonCount,
  locale,
  t,
}: ExportDungeonFilterProps) {
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
            count: visibleDungeons.length,
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

              return (
                <Chip
                  key={dungeon.id}
                  size="small"
                  variant="outlined"
                  sx={{
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
                        {formatDungeonExportLabel(dungeon, locale)}
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
