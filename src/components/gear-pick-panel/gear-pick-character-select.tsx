import { Box, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { getLocalizedSpecName } from "../../i18n/localized-domain.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { CharacterRecord, CharacterSpecGear } from "../../types/characters.ts";
import type { GearPickSpecSide } from "../../utils/build-gear-pick-items.ts";
import {
  CharacterSpecListName,
  InactiveSpecTooltip,
  SpecCell,
} from "../character-spec-list/index.ts";
import {
  CHARACTER_SPEC_LIST_ICON_SIZE,
  getCharacterSpecListGridSx,
  getExportFilterSpecsListMaxHeight,
} from "../export-panel/constants.ts";
import { CharacterSpecGearLabel } from "../spec-option-label/index.tsx";

export type GearPickCharacterSelection = {
  characterId: string;
  side: GearPickSpecSide;
};

export type GearPickCharacterInactiveReason = "cooldown" | "noUpgrades";

type GearPickCharacterSelectProps = {
  characters: readonly CharacterRecord[];
  /** Characters not on CD for every active raid. */
  availableCharacterIds: ReadonlySet<string>;
  /** Characters with Soft pick BiS targets in active raids. */
  charactersWithUpgradesIds: ReadonlySet<string>;
  /** When true, characters without upgrades are dimmed and non-selectable. */
  onlyWithUpgrades: boolean;
  selection: GearPickCharacterSelection | null;
  onSelectionChange: (selection: GearPickCharacterSelection) => void;
  t: TranslateFn;
};

function selectionValue(selection: GearPickCharacterSelection): string {
  return `${selection.characterId}:${selection.side}`;
}

function parseSelectionValue(value: string): GearPickCharacterSelection | null {
  const [characterId, side] = value.split(":");
  if (!characterId || (side !== "main" && side !== "off")) {
    return null;
  }
  return { characterId, side };
}

function getInactiveReason(
  characterId: string,
  availableCharacterIds: ReadonlySet<string>,
  charactersWithUpgradesIds: ReadonlySet<string>,
  onlyWithUpgrades: boolean,
): GearPickCharacterInactiveReason | null {
  if (!availableCharacterIds.has(characterId)) {
    return "cooldown";
  }
  if (onlyWithUpgrades && !charactersWithUpgradesIds.has(characterId)) {
    return "noUpgrades";
  }
  return null;
}

function inactiveTooltipKey(
  reason: GearPickCharacterInactiveReason,
):
  | "exportPanel.characterInactiveCooldownHint"
  | "gearPickPanel.characterInactiveNoUpgradesHint" {
  return reason === "cooldown"
    ? "exportPanel.characterInactiveCooldownHint"
    : "gearPickPanel.characterInactiveNoUpgradesHint";
}

function GearPickSpecRadio({
  character,
  specGear,
  side,
  inactiveReason,
  t,
}: {
  character: CharacterRecord;
  specGear: CharacterSpecGear;
  side: GearPickSpecSide;
  inactiveReason: GearPickCharacterInactiveReason | null;
  t: TranslateFn;
}) {
  const { locale } = useTranslation();

  if (!character.class) {
    return null;
  }

  const cooldownInactive = inactiveReason === "cooldown";
  const upgradesInactive = inactiveReason === "noUpgrades";
  const inactive = inactiveReason !== null;

  const control = (
    <FormControlLabel
      value={selectionValue({ characterId: character.id, side })}
      control={<Radio size="small" disabled={inactive} />}
      aria-label={t("gearPickPanel.selectSpecAria", {
        name: character.name,
        spec: getLocalizedSpecName(character.class.name, specGear.spec, locale),
      })}
      label={
        <CharacterSpecGearLabel
          characterClass={character.class}
          spec={specGear.spec}
          gearScore={specGear.gearScore}
          iconSize={CHARACTER_SPEC_LIST_ICON_SIZE}
          variant="caption"
          showSpecName={false}
          showDetailTooltip={false}
          color={inactive ? "text.secondary" : "inherit"}
        />
      }
      sx={{
        m: 0,
        gap: 0.25,
        minWidth: 0,
        "& .MuiRadio-root": {
          p: 0.25,
          ...(inactive ? { opacity: 0.45 } : null),
        },
        "& .MuiFormControlLabel-label": { ml: 0, minWidth: 0 },
        ...(cooldownInactive
          ? { "& img": { opacity: 0.45, filter: "grayscale(1)" } }
          : upgradesInactive
            ? { "& img": { opacity: 0.55 } }
            : null),
      }}
    />
  );

  return (
    <InactiveSpecTooltip
      title={inactiveReason ? t(inactiveTooltipKey(inactiveReason)) : null}
    >
      {control}
    </InactiveSpecTooltip>
  );
}

export function GearPickCharacterSelect({
  characters,
  availableCharacterIds,
  charactersWithUpgradesIds,
  onlyWithUpgrades,
  selection,
  onSelectionChange,
  t,
}: GearPickCharacterSelectProps) {
  const listMaxHeight = getExportFilterSpecsListMaxHeight();

  if (characters.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("common.none")}
      </Typography>
    );
  }

  return (
    <RadioGroup
      value={selection ? selectionValue(selection) : ""}
      onChange={(event) => {
        const next = parseSelectionValue(event.target.value);
        if (
          next &&
          getInactiveReason(
            next.characterId,
            availableCharacterIds,
            charactersWithUpgradesIds,
            onlyWithUpgrades,
          ) === null
        ) {
          onSelectionChange(next);
        }
      }}
      sx={getCharacterSpecListGridSx({ maxHeight: listMaxHeight })}
    >
      {characters.map((character) => {
        if (!character.class) {
          return null;
        }

        const hasMain = Boolean(character.mainSpec);
        const hasOff = Boolean(character.offSpec);
        const hasNoSpecs = !hasMain && !hasOff;
        const inactiveReason = getInactiveReason(
          character.id,
          availableCharacterIds,
          charactersWithUpgradesIds,
          onlyWithUpgrades,
        );

        return (
          <Box key={character.id} sx={{ display: "contents" }}>
            <InactiveSpecTooltip
              title={
                inactiveReason ? t(inactiveTooltipKey(inactiveReason)) : null
              }
            >
              <CharacterSpecListName
                name={character.name}
                inactive={inactiveReason !== null}
                inactiveTone={
                  inactiveReason === "noUpgrades" ? "filters" : "cooldown"
                }
              />
            </InactiveSpecTooltip>
            <SpecCell>
              {hasMain && character.mainSpec ? (
                <GearPickSpecRadio
                  character={character}
                  specGear={character.mainSpec}
                  side="main"
                  inactiveReason={inactiveReason}
                  t={t}
                />
              ) : hasNoSpecs ? (
                <Typography variant="caption" color="text.secondary">
                  {t("common.none")}
                </Typography>
              ) : null}
            </SpecCell>
            <SpecCell>
              {hasOff && character.offSpec ? (
                <GearPickSpecRadio
                  character={character}
                  specGear={character.offSpec}
                  side="off"
                  inactiveReason={inactiveReason}
                  t={t}
                />
              ) : null}
            </SpecCell>
          </Box>
        );
      })}
    </RadioGroup>
  );
}
