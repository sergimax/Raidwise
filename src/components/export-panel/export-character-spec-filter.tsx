import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { getLocalizedSpecName } from "../../i18n/localized-domain.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { CharacterRecord, CharacterSpecGear } from "../../types/characters.ts";
import type { ExportRoleFilter } from "../../utils/export-spec-role.ts";
import {
  characterHasExportSpecs,
  getCharacterExportInactiveReason,
  isSpecIncludedForExportRole,
  resolveEffectiveExportSpecSelection,
  specPassesExportMinGearScore,
  type CharacterExportInactiveReason,
  type CharacterExportSpecSelection,
  type ExportSpecSelectionByCharacterId,
} from "../../utils/format-character-export.ts";
import {
  CharacterSpecListName,
  InactiveSpecTooltip,
  SpecCell,
} from "../character-spec-list/index.ts";
import { CharacterSpecGearLabel } from "../spec-option-label/index.tsx";
import {
  CHARACTER_SPEC_LIST_ICON_SIZE,
  getCharacterSpecListGridSx,
} from "./constants.ts";

type ExportCharacterSpecFilterProps = {
  characters: CharacterRecord[];
  includedCharacterIds: ReadonlySet<string>;
  charactersWithUpgradesIds: ReadonlySet<string>;
  onlyWithUpgrades: boolean;
  exportSpecSelectionByCharacterId: ExportSpecSelectionByCharacterId;
  roleFilter: ExportRoleFilter;
  minGearScore: number | undefined;
  onSpecIncluded: (
    character: CharacterRecord,
    slot: keyof CharacterExportSpecSelection,
    included: boolean,
  ) => void;
};

type ExportSpecCheckboxProps = {
  character: CharacterRecord;
  specGear: CharacterSpecGear;
  slot: keyof CharacterExportSpecSelection;
  checked: boolean;
  disabled?: boolean;
  rowInactiveReason: CharacterExportInactiveReason | null;
  roleAllowed: boolean;
  gearScoreAllowed: boolean;
  onCheckedChange: (
    slot: keyof CharacterExportSpecSelection,
    included: boolean,
  ) => void;
  t: TranslateFn;
};

type SpecFilterTooltipKey =
  | "exportPanel.specInactiveRoleFilter"
  | "exportPanel.specInactiveGearScoreFilter"
  | "exportPanel.specInactiveRoleAndGearScoreFilter";

function characterInactiveTooltipKey(
  inactiveReason: CharacterExportInactiveReason,
):
  | "exportPanel.characterInactiveCooldownHint"
  | "exportPanel.characterInactiveFiltersHint"
  | "gearPickPanel.characterInactiveNoUpgradesHint" {
  if (inactiveReason === "cooldown") {
    return "exportPanel.characterInactiveCooldownHint";
  }
  if (inactiveReason === "noUpgrades") {
    return "gearPickPanel.characterInactiveNoUpgradesHint";
  }
  return "exportPanel.characterInactiveFiltersHint";
}

function specFilterTooltipKey(
  roleAllowed: boolean,
  gearScoreAllowed: boolean,
): SpecFilterTooltipKey | null {
  if (roleAllowed && gearScoreAllowed) {
    return null;
  }
  if (!roleAllowed && !gearScoreAllowed) {
    return "exportPanel.specInactiveRoleAndGearScoreFilter";
  }
  if (!roleAllowed) {
    return "exportPanel.specInactiveRoleFilter";
  }
  return "exportPanel.specInactiveGearScoreFilter";
}

function isRowLevelInactive(
  reason: CharacterExportInactiveReason | null,
): reason is "cooldown" | "noUpgrades" {
  return reason === "cooldown" || reason === "noUpgrades";
}

function ExportSpecCheckbox({
  character,
  specGear,
  slot,
  checked,
  disabled = false,
  rowInactiveReason,
  roleAllowed,
  gearScoreAllowed,
  onCheckedChange,
  t,
}: ExportSpecCheckboxProps) {
  const { locale } = useTranslation();

  if (!character.class) {
    return null;
  }

  const specLabel = getLocalizedSpecName(
    character.class.name,
    specGear.spec,
    locale,
  );
  const cooldownInactive = rowInactiveReason === "cooldown";
  const upgradesInactive = rowInactiveReason === "noUpgrades";
  const rowInactive = isRowLevelInactive(rowInactiveReason);
  const specFilteredOut = !rowInactive && (!roleAllowed || !gearScoreAllowed);
  const filterTooltipKey = specFilterTooltipKey(roleAllowed, gearScoreAllowed);
  const tooltipTitle = rowInactive
    ? t(characterInactiveTooltipKey(rowInactiveReason))
    : filterTooltipKey
      ? t(filterTooltipKey)
      : null;

  const control = (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked}
          disabled={disabled}
          onChange={(event) => {
            onCheckedChange(slot, event.target.checked);
          }}
          slotProps={{
            input: {
              "aria-label": t("exportPanel.includeSpecAria", {
                spec: specLabel,
                name: character.name,
              }),
            },
          }}
        />
      }
      label={
        <CharacterSpecGearLabel
          characterClass={character.class}
          spec={specGear.spec}
          gearScore={specGear.gearScore}
          iconSize={CHARACTER_SPEC_LIST_ICON_SIZE}
          variant="caption"
          showSpecName={false}
          showDetailTooltip={false}
          color={
            cooldownInactive || upgradesInactive || specFilteredOut
              ? "text.secondary"
              : "inherit"
          }
        />
      }
      sx={{
        m: 0,
        gap: 0.25,
        minWidth: 0,
        "& .MuiCheckbox-root": {
          p: 0.25,
          ...(cooldownInactive || upgradesInactive
            ? { opacity: 0.45 }
            : specFilteredOut
              ? { opacity: 0.55 }
              : null),
        },
        "& .MuiFormControlLabel-label": { ml: 0, minWidth: 0 },
        ...(cooldownInactive
          ? { "& img": { opacity: 0.45, filter: "grayscale(1)" } }
          : upgradesInactive
            ? { "& img": { opacity: 0.55 } }
            : null),
        ...(specFilteredOut
          ? { "& .MuiTypography-root": { textDecoration: "line-through" } }
          : null),
      }}
    />
  );

  return <InactiveSpecTooltip title={tooltipTitle}>{control}</InactiveSpecTooltip>;
}

export function ExportCharacterSpecFilter({
  characters,
  includedCharacterIds,
  charactersWithUpgradesIds,
  onlyWithUpgrades,
  exportSpecSelectionByCharacterId,
  roleFilter,
  minGearScore,
  onSpecIncluded,
}: ExportCharacterSpecFilterProps) {
  const { t } = useTranslation();

  if (characters.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("exportPanel.noCharacters")}
      </Typography>
    );
  }

  return (
    <Box sx={getCharacterSpecListGridSx()}>
      {characters.map((character) => {
        const inactiveReason = getCharacterExportInactiveReason(
          character,
          includedCharacterIds,
          roleFilter,
          minGearScore,
          {
            onlyWithUpgrades,
            charactersWithUpgradesIds,
          },
        );
        const selection = resolveEffectiveExportSpecSelection(
          character,
          exportSpecSelectionByCharacterId,
          roleFilter,
          minGearScore,
        );
        const hasSpecs = characterHasExportSpecs(character);
        const mainRoleAllowed =
          !character.mainSpec ||
          isSpecIncludedForExportRole(
            character,
            character.mainSpec.spec,
            roleFilter,
          );
        const offRoleAllowed =
          !character.offSpec ||
          isSpecIncludedForExportRole(
            character,
            character.offSpec.spec,
            roleFilter,
          );
        const mainGearScoreAllowed =
          !character.mainSpec ||
          specPassesExportMinGearScore(character.mainSpec, minGearScore);
        const offGearScoreAllowed =
          !character.offSpec ||
          specPassesExportMinGearScore(character.offSpec, minGearScore);
        const rowInactive = isRowLevelInactive(inactiveReason);
        const characterName = (
          <CharacterSpecListName
            name={character.name}
            inactive={Boolean(inactiveReason)}
            inactiveTone={
              inactiveReason === "filters" || inactiveReason === "noUpgrades"
                ? "filters"
                : "cooldown"
            }
          />
        );

        return (
          <Box key={character.id} sx={{ display: "contents" }}>
            {inactiveReason ? (
              <InactiveSpecTooltip
                title={t(characterInactiveTooltipKey(inactiveReason))}
              >
                {characterName}
              </InactiveSpecTooltip>
            ) : (
              characterName
            )}
            <SpecCell>
              {character.mainSpec ? (
                <ExportSpecCheckbox
                  character={character}
                  specGear={character.mainSpec}
                  slot="includeMain"
                  checked={selection.includeMain}
                  disabled={
                    rowInactive || !mainRoleAllowed || !mainGearScoreAllowed
                  }
                  rowInactiveReason={inactiveReason}
                  roleAllowed={mainRoleAllowed}
                  gearScoreAllowed={mainGearScoreAllowed}
                  onCheckedChange={(slot, included) => {
                    onSpecIncluded(character, slot, included);
                  }}
                  t={t}
                />
              ) : !hasSpecs ? (
                <InactiveSpecTooltip
                  title={
                    rowInactive
                      ? t(characterInactiveTooltipKey(inactiveReason))
                      : null
                  }
                >
                  <Checkbox
                    size="small"
                    checked={selection.includeWithoutSpec}
                    disabled={rowInactive}
                    sx={rowInactive ? { opacity: 0.45 } : undefined}
                    onChange={(event) => {
                      onSpecIncluded(
                        character,
                        "includeWithoutSpec",
                        event.target.checked,
                      );
                    }}
                    slotProps={{
                      input: {
                        "aria-label": t("exportPanel.includeCharacterAria", {
                          name: character.name,
                        }),
                      },
                    }}
                  />
                </InactiveSpecTooltip>
              ) : null}
            </SpecCell>
            <SpecCell>
              {character.offSpec ? (
                <ExportSpecCheckbox
                  character={character}
                  specGear={character.offSpec}
                  slot="includeOff"
                  checked={selection.includeOff}
                  disabled={
                    rowInactive || !offRoleAllowed || !offGearScoreAllowed
                  }
                  rowInactiveReason={inactiveReason}
                  roleAllowed={offRoleAllowed}
                  gearScoreAllowed={offGearScoreAllowed}
                  onCheckedChange={(slot, included) => {
                    onSpecIncluded(character, slot, included);
                  }}
                  t={t}
                />
              ) : null}
            </SpecCell>
          </Box>
        );
      })}
    </Box>
  );
}
