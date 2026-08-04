import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Box,
  IconButton,
  Stack,
  TableCell,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { characterNameDisplaySx } from "../../utils/character-display.ts";
import { formatCharacterDetailsTooltip } from "../../utils/format-character-details.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { CharacterRecord } from "../../types/characters.ts";
import { CharacterSpecGearLabel } from "../spec-option-label/index.tsx";
import { CompletionCountChip } from "./dungeon-cells.tsx";
import type { SortDirection } from "../../utils/sort-dungeons.ts";
import { CHARACTER_HEADER_CELL_SX } from "./table-layout.ts";

type CharacterHeaderCellProps = {
  character: CharacterRecord;
  completedCount: number;
  dungeonCount: number;
  isActiveSort: boolean;
  sortDirection: SortDirection;
  onSort: () => void;
  onResetCharacterToggles: (characterId: string) => void;
  onEditCharacter: (characterId: string) => void;
  onDeleteCharacter: (characterId: string) => void;
};

export function CharacterHeaderCell({
  character,
  completedCount,
  dungeonCount,
  isActiveSort,
  sortDirection,
  onSort,
  onResetCharacterToggles,
  onEditCharacter,
  onDeleteCharacter,
}: CharacterHeaderCellProps) {
  const { t, locale } = useTranslation();
  const theme = useTheme();
  const hasSpecGear = character.mainSpec !== undefined || character.offSpec !== undefined;
  const detailsTooltip = formatCharacterDetailsTooltip(character, locale);

  return (
    <TableCell key={character.id} align="center" sx={CHARACTER_HEADER_CELL_SX}>
      <Stack spacing={0.5} sx={{ alignItems: "center", minWidth: 0, width: "100%" }}>
        <Tooltip title={detailsTooltip}>
          <TableSortLabel
            active={isActiveSort}
            direction={isActiveSort ? sortDirection : "asc"}
            onClick={onSort}
            sx={{ "& .MuiTableSortLabel-icon": { marginLeft: "2px" } }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
                justifyContent: "center",
                minWidth: 0,
                maxWidth: "100%",
              }}
            >
              {character.class ? (
                <Box
                  component="img"
                  src={character.class.icon}
                  alt=""
                  width={18}
                  height={18}
                  sx={{ borderRadius: "4px", flexShrink: 0 }}
                />
              ) : null}
              <Typography
                variant="caption"
                sx={{
                  ...characterNameDisplaySx(character.class, theme.palette.mode),
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {character.name}
              </Typography>
            </Stack>
          </TableSortLabel>
        </Tooltip>

        {hasSpecGear && character.class ? (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              minWidth: 0,
              maxWidth: "100%",
              lineHeight: 1.2,
            }}
          >
            {character.mainSpec ? (
              <CharacterSpecGearLabel
                characterClass={character.class}
                spec={character.mainSpec.spec}
                gearScore={character.mainSpec.gearScore}
                iconSize={14}
                variant="caption"
                showSpecName={false}
              />
            ) : null}
            {character.mainSpec && character.offSpec ? (
              <Typography variant="caption" color="text.secondary" component="span">
                /
              </Typography>
            ) : null}
            {character.offSpec ? (
              <CharacterSpecGearLabel
                characterClass={character.class}
                spec={character.offSpec.spec}
                gearScore={character.offSpec.gearScore}
                iconSize={14}
                variant="caption"
                showSpecName={false}
              />
            ) : null}
          </Stack>
        ) : null}

        <CompletionCountChip completed={completedCount} total={dungeonCount} />

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: "wrap", justifyContent: "center" }}
        >
          <Tooltip title={t("table.editCharacter", { name: character.name })}>
            <IconButton
              size="small"
              color="default"
              onClick={() => {
                onEditCharacter(character.id);
              }}
              aria-label={t("table.editCharacter", { name: character.name })}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("table.resetCharacterToggles", { name: character.name })}>
            <IconButton
              size="small"
              color="default"
              onClick={() => {
                onResetCharacterToggles(character.id);
              }}
              aria-label={t("table.resetCharacterToggles", { name: character.name })}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("table.removeCharacter", { name: character.name })}>
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                onDeleteCharacter(character.id);
              }}
              aria-label={t("table.removeCharacter", { name: character.name })}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </TableCell>
  );
}
