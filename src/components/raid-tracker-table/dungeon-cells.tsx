import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";
import { getLocalizedDungeonCompactLabel, getLocalizedDungeonDisplayName } from "../../i18n/localized-domain.ts";
import {
  DungeonDifficulty,
  type Dungeon,
  type DungeonDifficulty as DungeonDifficultyType,
  type DungeonSize,
} from "../../types/dungeons.ts";
import { formatDungeonTypeLabel } from "../../utils/dungeon-type.ts";
import { completionChipFill } from "../../utils/completion-chip-color.ts";
import { emblemIcons, type EmblemKey } from "../../assets/emblems/emblem-icons.ts";

type SizeChipColor = "success" | "info" | "secondary" | "warning" | "error";

function sizeChipColor(size: number): SizeChipColor {
  if (size <= 5) return "success";
  if (size <= 10) return "info";
  if (size <= 20) return "secondary";
  if (size <= 25) return "warning";
  return "error";
}

export function DungeonNameCell({
  name,
  shortName,
  raidKey,
  size,
  difficulty,
  compact,
  emblem,
}: {
  name: string;
  shortName?: string;
  raidKey?: Dungeon["raidKey"];
  size: DungeonSize;
  difficulty: DungeonDifficultyType;
  compact: boolean;
  emblem: EmblemKey | null;
}) {
  const { locale, t } = useTranslation();
  const dungeon = { name, shortName, raidKey, size, difficulty };
  const displayName = compact
    ? getLocalizedDungeonCompactLabel(dungeon, locale, t("table.heroicSkullIcon"))
    : getLocalizedDungeonDisplayName(dungeon, locale, false);
  const fullName = getLocalizedDungeonDisplayName(
    { name, shortName, raidKey },
    locale,
    false,
  );
  const showFullNameTooltip = compact && displayName !== fullName;

  const nameLabel = (
    <Typography
      component="span"
      variant="body2"
      className="raid-tracker-table__dungeon-name"
      sx={{
        fontWeight: 600,
        lineHeight: 1.3,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {displayName}
    </Typography>
  );

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{ alignItems: "center", overflow: "hidden", minWidth: 0 }}
    >
      {emblem ? (
        <Box
          component="img"
          src={emblemIcons[emblem]}
          alt=""
          sx={{ width: 18, height: 18, flexShrink: 0, borderRadius: "4px" }}
        />
      ) : null}
      {showFullNameTooltip ? (
        <Tooltip title={fullName}>
          <span className="raid-tracker-table__dungeon-name-wrap">{nameLabel}</span>
        </Tooltip>
      ) : (
        nameLabel
      )}
    </Stack>
  );
}

export function ItemLevelCell({ itemLevels }: { itemLevels: number[] }) {
  const { t } = useTranslation();

  if (itemLevels.length === 0) {
    return (
      <Typography component="span" variant="body2" color="text.secondary">
        {t("table.emptyIlvl")}
      </Typography>
    );
  }

  return (
    <>
      {itemLevels.map((itemLevel, index) => (
        <span key={`${itemLevel}-${index}`}>
          {index > 0 ? (
            <span className="raid-tracker-table__ilvl-separator"> / </span>
          ) : null}
          <Box
            component="span"
            className="raid-tracker-table__ilvl"
            sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
          >
            {itemLevel}
          </Box>
        </span>
      ))}
    </>
  );
}

export function DungeonTypeCell({
  size,
  difficulty,
}: {
  size: DungeonSize;
  difficulty: DungeonDifficultyType;
}) {
  const { locale, t } = useTranslation();
  const isHeroic = difficulty === DungeonDifficulty.HEROIC;
  const chipColor = sizeChipColor(size);
  const label = formatDungeonTypeLabel(
    { size, difficulty },
    locale,
    isHeroic ? "skull" : "suffix",
    t("table.heroicSkullIcon"),
  );

  return (
    <Chip
      size="small"
      variant="filled"
      color={chipColor}
      label={label}
      sx={{
        maxWidth: "100%",
        ...(isHeroic
          ? {
              backgroundColor: (theme) => theme.palette.error.dark,
              color: (theme) => theme.palette.error.contrastText,
            }
          : {}),
        // Do not ellipsis — skull emoji was clipping to "…" in the narrow type column.
        "& .MuiChip-label": {
          overflow: "visible",
          textOverflow: "clip",
          px: 0.75,
          whiteSpace: "nowrap",
        },
      }}
    />
  );
}

/**
 * Determinate linear progress (MUI LinearProgress). Count `completed/total` is hover-only.
 * Bar color follows theme completion stops (`completionChipFill`).
 */
export function CompletionCountChip({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const theme = useTheme();
  const fill = completionChipFill(completed, total, theme);
  const progressValue =
    total <= 0 ? 0 : Math.min(100, Math.max(0, (completed / total) * 100));
  const label = `${completed}/${total}`;
  const trackColor =
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(0, 0, 0, 0.1)";

  return (
    <Tooltip title={label}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          py: 0.25,
        }}
        role="img"
        aria-label={label}
      >
        <LinearProgress
          variant="determinate"
          value={progressValue}
          aria-hidden
          sx={{
            width: "100%",
            height: 6,
            borderRadius: 1,
            bgcolor: trackColor,
            "& .MuiLinearProgress-bar": {
              borderRadius: 1,
              bgcolor: fill.backgroundColor,
            },
          }}
        />
      </Box>
    </Tooltip>
  );
}

