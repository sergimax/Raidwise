import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MAX_CHARACTER_NAME_LENGTH } from "../../constants/character.ts";
import { specsForClass } from "../../data/class-specs.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { Classes } from "../../types/characters.ts";
import { CharacterSpecGearImportSection } from "../character-edit-dialog/character-spec-gear-import-section.tsx";
import { CharacterSingleSpecGearFields } from "../character-spec-gear-fields/index.tsx";
import { ClassOptionLabel } from "../class-option-label/index.tsx";
import { FilterSection } from "../filter-unit/filter-section.tsx";
import { FormActionsRow } from "../form-actions-row/index.tsx";
import { FormErrorMessage } from "../form-error-message/index.tsx";
import {
  FILTER_UNIT_GRID_GAP_SPACING,
  getCharacterFormGridTemplateColumns,
} from "./constants.ts";
import type { CharacterFormProps } from "./types.ts";

const characterOverflowVisibleContentSx = { overflow: "visible" } as const;

export function CharacterForm({
  name,
  characterClass,
  mainSpec,
  mainGearScoreText,
  offSpec,
  offGearScoreText,
  mainGearItems,
  offGearItems,
  error,
  onNameChange,
  onClassChange,
  onMainSpecChange,
  onMainGearScoreTextChange,
  onOffSpecChange,
  onOffGearScoreTextChange,
  onMainGearItemsChange,
  onOffGearItemsChange,
  onImportError,
  onClearImportError,
  onSubmit,
}: CharacterFormProps) {
  const { t, locale } = useTranslation();
  const classSpecs =
    characterClass === "" ? [] : specsForClass(characterClass.name);
  const specsDisabled = characterClass === "";
  const mainImportDisabled = characterClass === "" || mainSpec === "";
  const offImportDisabled = characterClass === "" || offSpec === "";
  const optionalMark = t("common.optional");

  const mainImportReason =
    characterClass === ""
      ? t("characterForm.wseNeedsClass")
      : t("characterForm.wseNeedsSpec");
  const offImportReason =
    characterClass === ""
      ? t("characterForm.wseNeedsClass")
      : t("characterForm.wseNeedsSpec");

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: getCharacterFormGridTemplateColumns(),
            },
            gap: FILTER_UNIT_GRID_GAP_SPACING,
            alignItems: "stretch",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <FilterSection
            step={1}
            title={t("characterForm.stepIdentity")}
            contentSx={characterOverflowVisibleContentSx}
          >
            <Stack spacing={1.25}>
              <TextField
                label={t("common.name")}
                name="characterName"
                value={name}
                onChange={(event) => {
                  onNameChange(event.target.value);
                }}
                required
                autoComplete="off"
                size="small"
                slotProps={{
                  htmlInput: { maxLength: MAX_CHARACTER_NAME_LENGTH },
                }}
                helperText={t("characterForm.nameLettersOnlyHint", {
                  count: name.length,
                  max: MAX_CHARACTER_NAME_LENGTH,
                })}
              />
              <FormControl required size="small">
                <InputLabel id="character-class-label">
                  {t("common.class")}
                </InputLabel>
                <Select
                  labelId="character-class-label"
                  label={t("common.class")}
                  name="characterClass"
                  value={characterClass === "" ? "" : characterClass.name}
                  renderValue={(selectedName) => {
                    if (!selectedName) {
                      return "";
                    }
                    const selectedClass = Classes.find(
                      (option) => option.name === selectedName,
                    );
                    if (!selectedClass) {
                      return selectedName;
                    }
                    return <ClassOptionLabel characterClass={selectedClass} />;
                  }}
                  onChange={(event) => {
                    const selectedName = event.target.value;
                    const selectedClass = Classes.find(
                      (option) => option.name === selectedName,
                    );
                    onClassChange(selectedClass ?? "");
                  }}
                >
                  {Classes.map((option) => (
                    <MenuItem key={option.name} value={option.name}>
                      <ClassOptionLabel characterClass={option} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </FilterSection>

          <FilterSection
            step={2}
            title={t("characterForm.stepMain")}
            titleMark={optionalMark}
            contentSx={characterOverflowVisibleContentSx}
          >
            <Stack spacing={1.25}>
              <CharacterSingleSpecGearFields
                label={t("characterForm.main")}
                spec={mainSpec}
                gearScoreText={mainGearScoreText}
                specName="mainSpec"
                gearScoreName="mainGearScore"
                specLabelId="character-main-spec-label"
                characterClass={characterClass}
                classSpecs={classSpecs}
                disabled={specsDisabled}
                size="small"
                showHelperText={false}
                hideLabel
                onSpecChange={onMainSpecChange}
                onGearScoreTextChange={onMainGearScoreTextChange}
              />
              <Stack spacing={0.75}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    lineHeight: 1.3,
                  }}
                >
                  {t("characterForm.importGear")}{" "}
                  <BoxMutedOptional mark={optionalMark} />
                </Typography>
                <CharacterSpecGearImportSection
                  label={t("characterForm.importGear")}
                  spec={mainSpec || undefined}
                  characterClass={characterClass}
                  gearItems={mainGearItems}
                  onGearItemsChange={onMainGearItemsChange}
                  onError={onImportError}
                  onClearError={onClearImportError}
                  locale={locale}
                  t={t}
                  hideHeader
                  compact
                  disabled={mainImportDisabled}
                  disabledReason={mainImportReason}
                />
              </Stack>
            </Stack>
          </FilterSection>

          <FilterSection
            step={3}
            title={t("characterForm.stepOff")}
            titleMark={optionalMark}
            contentSx={characterOverflowVisibleContentSx}
          >
            <Stack spacing={1.25}>
              <CharacterSingleSpecGearFields
                label={t("characterForm.off")}
                spec={offSpec}
                gearScoreText={offGearScoreText}
                specName="offSpec"
                gearScoreName="offGearScore"
                specLabelId="character-off-spec-label"
                characterClass={characterClass}
                classSpecs={classSpecs}
                disabled={specsDisabled}
                size="small"
                showHelperText={false}
                hideLabel
                onSpecChange={onOffSpecChange}
                onGearScoreTextChange={onOffGearScoreTextChange}
              />
              <Stack spacing={0.75}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    lineHeight: 1.3,
                  }}
                >
                  {t("characterForm.importGear")}{" "}
                  <BoxMutedOptional mark={optionalMark} />
                </Typography>
                <CharacterSpecGearImportSection
                  label={t("characterForm.importGear")}
                  spec={offSpec || undefined}
                  characterClass={characterClass}
                  gearItems={offGearItems}
                  onGearItemsChange={onOffGearItemsChange}
                  onError={onImportError}
                  onClearError={onClearImportError}
                  locale={locale}
                  t={t}
                  hideHeader
                  compact
                  disabled={offImportDisabled}
                  disabledReason={offImportReason}
                />
              </Stack>
            </Stack>
          </FilterSection>
        </Box>

        <FormActionsRow submitLabel={t("characterForm.addCharacter")} />
        {error ? <FormErrorMessage message={error} /> : null}
      </Stack>
    </form>
  );
}

function BoxMutedOptional({ mark }: { mark: string }) {
  return (
    <Typography
      component="span"
      variant="caption"
      sx={{ color: "text.secondary", fontWeight: 500 }}
    >
      ({mark})
    </Typography>
  );
}
