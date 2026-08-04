import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Box,
  IconButton,
  Stack,
  TableCell,
  Tooltip,
  Typography,
} from "@mui/material";
import { characterNameDisplaySx, formatCharacterDisplayName } from "../../utils/character-display.ts";
import { formatCharacterDetailsTooltip } from "../../utils/format-character-details.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { CharacterRecord } from "../../types/characters.ts";
import { CharacterSpecGearLabel } from "../spec-option-label/index.tsx";
import { CHARACTER_HEADER_CELL_SX } from "./table-layout.ts";

type CharacterHeaderCellProps = {
  character: CharacterRecord;
  onResetCharacterToggles: (characterId: string) => void;
  onEditCharacter: (characterId: string) => void;
  onDeleteCharacter: (characterId: string) => void;
};

const SPEC_GEAR_ROW_SX = {
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  minWidth: 0,
  maxWidth: "100%",
  lineHeight: 1.2,
} as const;

const CONTROLS_ROW_SX = {
  flexWrap: "nowrap",
  justifyContent: "center",
  alignItems: "center",
} as const;

/** Keeps caption row height when a main/off side has no spec or GS. */
function SpecGearPlaceholder() {
  return (
    <Typography variant="caption" color="text.secondary" component="span">
      -
    </Typography>
  );
}

export function CharacterHeaderCell({
  character,
  onResetCharacterToggles,
  onEditCharacter,
  onDeleteCharacter,
}: CharacterHeaderCellProps) {
  const { t, locale } = useTranslation();
  const displayName = formatCharacterDisplayName(character.name);
  const detailsTooltip = formatCharacterDetailsTooltip(character, locale);
  const characterClass = character.class;
  const mainSlot =
    characterClass && character.mainSpec ? (
      <CharacterSpecGearLabel
        characterClass={characterClass}
        spec={character.mainSpec.spec}
        gearScore={character.mainSpec.gearScore}
        iconSize={14}
        variant="caption"
        showSpecName={false}
      />
    ) : (
      <SpecGearPlaceholder />
    );
  const offSlot =
    characterClass && character.offSpec ? (
      <CharacterSpecGearLabel
        characterClass={characterClass}
        spec={character.offSpec.spec}
        gearScore={character.offSpec.gearScore}
        iconSize={14}
        variant="caption"
        showSpecName={false}
      />
    ) : (
      <SpecGearPlaceholder />
    );

  return (
    <TableCell key={character.id} align="center" sx={CHARACTER_HEADER_CELL_SX}>
      <Stack
        spacing={0.5}
        sx={{
          alignItems: "center",
          justifyContent: "flex-start",
          minWidth: 0,
          width: "100%",
        }}
      >
        <Tooltip title={detailsTooltip}>
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
            {characterClass ? (
              <Box
                component="img"
                src={characterClass.icon}
                alt=""
                width={18}
                height={18}
                sx={{ borderRadius: "4px", flexShrink: 0 }}
              />
            ) : null}
            <Typography
              variant="caption"
              sx={{
                ...characterNameDisplaySx(characterClass),
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </Typography>
          </Stack>
        </Tooltip>

        <Stack direction="row" spacing={0.5} sx={SPEC_GEAR_ROW_SX}>
          {mainSlot}
          <Typography variant="caption" color="text.secondary" component="span">
            /
          </Typography>
          {offSlot}
        </Stack>

        <Stack direction="row" spacing={0.25} sx={CONTROLS_ROW_SX}>
          <Tooltip title={t("table.editCharacter", { name: displayName })}>
            <IconButton
              size="small"
              color="default"
              onClick={() => {
                onEditCharacter(character.id);
              }}
              aria-label={t("table.editCharacter", { name: displayName })}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("table.resetCharacterToggles", { name: displayName })}>
            <IconButton
              size="small"
              color="default"
              onClick={() => {
                onResetCharacterToggles(character.id);
              }}
              aria-label={t("table.resetCharacterToggles", { name: displayName })}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("table.removeCharacter", { name: displayName })}>
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                onDeleteCharacter(character.id);
              }}
              aria-label={t("table.removeCharacter", { name: displayName })}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </TableCell>
  );
}
