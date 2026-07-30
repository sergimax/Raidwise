import { Stack } from "@mui/material";
import { useMemo } from "react";
import { specsForClass } from "../../data/class-specs.ts";
import type { ItemTooltipLocale } from "../../constants/item-tooltips.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import type { CharacterClass } from "../../types/characters.ts";
import type { CharacterGearItem } from "../../types/character-gear.ts";
import { getSpecGearSyncHints } from "../../utils/character-spec-gear-sync-hints.ts";
import { CharacterSingleSpecGearFields } from "../character-spec-gear-fields/index.tsx";
import { CharacterSpecGearImportSection } from "./character-spec-gear-import-section.tsx";
import { CharacterSpecGearSyncHint } from "./character-spec-gear-sync-hint.tsx";

type CharacterSpecGearColumnProps = {
  roleLabel: string;
  importSectionLabel: string;
  spec: string;
  gearScoreText: string;
  initialGearScoreText: string;
  specName: string;
  gearScoreName: string;
  specLabelId: string;
  characterClass: CharacterClass;
  gearItems: CharacterGearItem[] | undefined;
  initialGearItems: CharacterGearItem[] | undefined;
  onSpecChange: (value: string) => void;
  onGearScoreTextChange: (value: string) => void;
  onGearItemsChange: (gearItems: CharacterGearItem[] | undefined) => void;
  onError: (message: string) => void;
  onClearError: () => void;
  locale: ItemTooltipLocale;
  t: TranslateFn;
};

export function CharacterSpecGearColumn({
  roleLabel,
  importSectionLabel,
  spec,
  gearScoreText,
  initialGearScoreText,
  specName,
  gearScoreName,
  specLabelId,
  characterClass,
  gearItems,
  initialGearItems,
  onSpecChange,
  onGearScoreTextChange,
  onGearItemsChange,
  onError,
  onClearError,
  locale,
  t,
}: CharacterSpecGearColumnProps) {
  const classSpecs = specsForClass(characterClass.name);
  const syncHints = useMemo(
    () =>
      getSpecGearSyncHints({
        spec,
        initialGearScoreText,
        gearScoreText,
        initialGearItems,
        currentGearItems: gearItems,
      }),
    [gearItems, gearScoreText, initialGearItems, initialGearScoreText, spec],
  );

  return (
    <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
      <CharacterSingleSpecGearFields
        label={roleLabel}
        spec={spec}
        gearScoreText={gearScoreText}
        specName={specName}
        gearScoreName={gearScoreName}
        specLabelId={specLabelId}
        characterClass={characterClass}
        classSpecs={classSpecs}
        disabled={false}
        layout="row"
        size="small"
        showHelperText={false}
        onSpecChange={onSpecChange}
        onGearScoreTextChange={onGearScoreTextChange}
      />
      <CharacterSpecGearSyncHint hints={syncHints} t={t} />
      <CharacterSpecGearImportSection
        label={importSectionLabel}
        spec={spec || undefined}
        characterClass={characterClass}
        gearItems={gearItems}
        onGearItemsChange={onGearItemsChange}
        onError={onError}
        onClearError={onClearError}
        locale={locale}
        t={t}
        hideHeader
        compact
      />
    </Stack>
  );
}
