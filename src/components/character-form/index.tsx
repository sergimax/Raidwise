import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { MAX_CHARACTER_NAME_LENGTH } from "../../constants/character.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { Classes } from "../../types/characters.ts";
import { CharacterSpecGearImportSection } from "../character-edit-dialog/character-spec-gear-import-section.tsx";
import { CharacterSpecGearFields } from "../character-spec-gear-fields/index.tsx";
import { ClassOptionLabel } from "../class-option-label/index.tsx";
import { FormActionsRow } from "../form-actions-row/index.tsx";
import { FormErrorMessage } from "../form-error-message/index.tsx";
import type { CharacterFormProps } from "./types.ts";

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

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label={t("common.name")}
          name="characterName"
          value={name}
          onChange={(event) => {
            onNameChange(event.target.value);
          }}
          required
          autoComplete="off"
          slotProps={{
            htmlInput: { maxLength: MAX_CHARACTER_NAME_LENGTH },
          }}
          helperText={`${name.length}/${MAX_CHARACTER_NAME_LENGTH}`}
        />
        <FormControl required>
          <InputLabel id="character-class-label">{t("common.class")}</InputLabel>
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
        <CharacterSpecGearFields
          characterClass={characterClass}
          mainSpec={mainSpec}
          mainGearScoreText={mainGearScoreText}
          offSpec={offSpec}
          offGearScoreText={offGearScoreText}
          onMainSpecChange={onMainSpecChange}
          onMainGearScoreTextChange={onMainGearScoreTextChange}
          onOffSpecChange={onOffSpecChange}
          onOffGearScoreTextChange={onOffGearScoreTextChange}
          mainFooter={
            characterClass !== "" ? (
              <CharacterSpecGearImportSection
                label={t("characterForm.main")}
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
              />
            ) : null
          }
          offFooter={
            characterClass !== "" ? (
              <CharacterSpecGearImportSection
                label={t("characterForm.off")}
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
              />
            ) : null
          }
        />
        <FormActionsRow submitLabel={t("characterForm.addCharacter")} />
        {error ? <FormErrorMessage message={error} /> : null}
      </Stack>
    </form>
  );
}
