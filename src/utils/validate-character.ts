import {
  MAX_CHARACTER_GEAR_SCORE,
  MAX_CHARACTER_NAME_LENGTH,
  MIN_CHARACTER_GEAR_SCORE,
} from "../constants/character.ts";
import { isSpecValidForClass } from "../data/class-specs.ts";
import type { AppLocale } from "../i18n/types.ts";
import { createTranslator } from "../i18n/translate.ts";
import type { CharacterGearItem } from "../types/character-gear.ts";
import type {
  CharacterClass,
  CharacterRecord,
  CharacterSpecGear,
} from "../types/characters.ts";
import { parseOptionalGearScore } from "./parse-optional-gear-score.ts";

export type CharacterFormValues = {
  name: string;
  characterClass: CharacterClass | "";
  mainSpec: string;
  mainGearScoreText: string;
  offSpec: string;
  offGearScoreText: string;
  mainGearItems?: CharacterGearItem[];
  offGearItems?: CharacterGearItem[];
};

export type ParsedCharacterFields = {
  name: string;
  characterClass: CharacterClass;
  mainSpec?: CharacterSpecGear;
  offSpec?: CharacterSpecGear;
};

export type ParseCharacterFormResult =
  | { ok: true } & ParsedCharacterFields
  | { ok: false; error: string };

export type CharacterSpecGearFormValues = Pick<
  CharacterFormValues,
  "mainSpec" | "mainGearScoreText" | "offSpec" | "offGearScoreText"
>;

export type ParseCharacterSpecGearResult =
  | {
      ok: true;
      mainSpec?: CharacterSpecGear;
      offSpec?: CharacterSpecGear;
    }
  | { ok: false; error: string };

function parseGearScoreField(text: string): number | undefined | typeof Number.NaN {
  return parseOptionalGearScore(text);
}

function parseSpecGearPair(
  specValue: string,
  gearScoreText: string,
  specLabelKey: "validation.mainSpecLabel" | "validation.offSpecLabel",
  locale: AppLocale,
  gearItems?: CharacterGearItem[],
): CharacterSpecGear | undefined | { error: string } {
  const t = createTranslator(locale);
  const specLabel = t(specLabelKey);

  const spec = specValue.trim() || undefined;
  const gearScore = parseGearScoreField(gearScoreText);
  const hasGearItems = gearItems !== undefined && gearItems.length > 0;

  if (Number.isNaN(gearScore)) {
    return {
      error: t("validation.gearScoreRange", {
        specLabel,
        min: MIN_CHARACTER_GEAR_SCORE,
        max: MAX_CHARACTER_GEAR_SCORE,
      }),
    };
  }

  if (!spec && (gearScore !== undefined || hasGearItems)) {
    return {
      error: t("validation.gearScoreNeedsSpec", {
        specLabel: specLabel.toLowerCase(),
      }),
    };
  }

  if (!spec) {
    return undefined;
  }

  const next: CharacterSpecGear = { spec };
  if (gearScore !== undefined) {
    next.gearScore = gearScore;
  }
  if (hasGearItems) {
    next.gearItems = gearItems;
  }
  return next;
}

export function parseCharacterSpecGearFields(
  values: CharacterSpecGearFormValues &
    Pick<CharacterFormValues, "mainGearItems" | "offGearItems">,
  characterClass: CharacterClass,
  locale: AppLocale = "en",
): ParseCharacterSpecGearResult {
  const t = createTranslator(locale);

  const mainResult = parseSpecGearPair(
    values.mainSpec,
    values.mainGearScoreText,
    "validation.mainSpecLabel",
    locale,
    values.mainGearItems,
  );
  if (mainResult && "error" in mainResult) {
    return { ok: false, error: mainResult.error };
  }

  const offResult = parseSpecGearPair(
    values.offSpec,
    values.offGearScoreText,
    "validation.offSpecLabel",
    locale,
    values.offGearItems,
  );
  if (offResult && "error" in offResult) {
    return { ok: false, error: offResult.error };
  }

  const mainSpec = mainResult;
  const offSpec = offResult;

  if (mainSpec && !isSpecValidForClass(characterClass.name, mainSpec.spec)) {
    return { ok: false, error: t("validation.invalidMainSpec") };
  }
  if (offSpec && !isSpecValidForClass(characterClass.name, offSpec.spec)) {
    return { ok: false, error: t("validation.invalidOffSpec") };
  }
  if (mainSpec && offSpec && mainSpec.spec === offSpec.spec) {
    return { ok: false, error: t("validation.specsMustDiffer") };
  }

  return { ok: true, mainSpec, offSpec };
}

export function parseCharacterForm(
  values: CharacterFormValues,
  existingCharacters: CharacterRecord[],
  locale: AppLocale = "en",
): ParseCharacterFormResult {
  const t = createTranslator(locale);
  const trimmedName = values.name.trim();
  const { characterClass } = values;
  if (!trimmedName || !characterClass) {
    return { ok: false, error: t("validation.characterNameRequired") };
  }
  if (trimmedName.length > MAX_CHARACTER_NAME_LENGTH) {
    return {
      ok: false,
      error: t("validation.characterNameTooLong", {
        max: MAX_CHARACTER_NAME_LENGTH,
      }),
    };
  }
  const isDuplicate = existingCharacters.some(
    (existing) =>
      existing.name.toLowerCase() === trimmedName.toLowerCase() &&
      existing.class?.name === characterClass.name,
  );
  if (isDuplicate) {
    return { ok: false, error: t("validation.characterDuplicate") };
  }

  const specGearResult = parseCharacterSpecGearFields(values, characterClass, locale);
  if (!specGearResult.ok) {
    return specGearResult;
  }

  return {
    ok: true,
    name: trimmedName,
    characterClass,
    mainSpec: specGearResult.mainSpec,
    offSpec: specGearResult.offSpec,
  };
}

export function characterSpecGearFormValues(
  character: CharacterRecord,
): CharacterSpecGearFormValues {
  return {
    mainSpec: character.mainSpec?.spec ?? "",
    mainGearScoreText:
      character.mainSpec?.gearScore !== undefined
        ? String(character.mainSpec.gearScore)
        : "",
    offSpec: character.offSpec?.spec ?? "",
    offGearScoreText:
      character.offSpec?.gearScore !== undefined
        ? String(character.offSpec.gearScore)
        : "",
  };
}
