import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { specsForClass } from "../../data/class-specs.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type { CharacterClass } from "../../types/characters.ts";
import { SpecOptionLabel } from "../spec-option-label/index.tsx";

export type CharacterSpecGearFieldsProps = {
  characterClass: CharacterClass | "";
  mainSpec: string;
  mainGearScoreText: string;
  offSpec: string;
  offGearScoreText: string;
  onMainSpecChange: (value: string) => void;
  onMainGearScoreTextChange: (value: string) => void;
  onOffSpecChange: (value: string) => void;
  onOffGearScoreTextChange: (value: string) => void;
  /** Optional content under the main-spec fields (e.g. WowSims import). */
  mainFooter?: ReactNode;
  /** Optional content under the off-spec fields (e.g. WowSims import). */
  offFooter?: ReactNode;
};

export type CharacterSingleSpecGearFieldsProps = {
  label: string;
  spec: string;
  gearScoreText: string;
  specName: string;
  gearScoreName: string;
  specLabelId: string;
  characterClass: CharacterClass | "";
  classSpecs: readonly string[];
  disabled: boolean;
  layout?: "row" | "column";
  size?: "small" | "medium";
  showHelperText?: boolean;
  /** When true, omit the Main/Off caption (parent step title covers it). */
  hideLabel?: boolean;
  onSpecChange: (value: string) => void;
  onGearScoreTextChange: (value: string) => void;
};

export function CharacterSingleSpecGearFields({
  label,
  spec,
  gearScoreText,
  specName,
  gearScoreName,
  specLabelId,
  characterClass,
  classSpecs,
  disabled,
  layout = "row",
  size = "medium",
  showHelperText = true,
  hideLabel = false,
  onSpecChange,
  onGearScoreTextChange,
}: CharacterSingleSpecGearFieldsProps) {
  const { t } = useTranslation();
  const fieldsDirection =
    layout === "column"
      ? "column"
      : ({ xs: "column", sm: "row" } as const);

  return (
    <Stack spacing={0.5}>
      {!hideLabel ? (
        <Typography
          variant={size === "small" ? "caption" : "body2"}
          color="text.secondary"
          sx={size === "small" ? { fontWeight: 600, letterSpacing: 0.02 } : undefined}
        >
          {label}
        </Typography>
      ) : null}
      <Stack direction={fieldsDirection} spacing={size === "small" ? 1 : 2}>
        <FormControl size={size} sx={{ flex: 1, minWidth: 0 }} disabled={disabled}>
          <InputLabel id={specLabelId}>{t("common.spec")}</InputLabel>
          <Select
            labelId={specLabelId}
            label={t("common.spec")}
            name={specName}
            value={spec}
            renderValue={(selected) => {
              if (!selected) {
                return <em>{t("common.none")}</em>;
              }
              if (characterClass === "") {
                return selected;
              }
              return (
                <SpecOptionLabel
                  className={characterClass.name}
                  spec={selected}
                />
              );
            }}
            onChange={(event) => {
              onSpecChange(event.target.value);
            }}
          >
            <MenuItem value="">
              <em>{t("common.none")}</em>
            </MenuItem>
            {classSpecs.map((option) => (
              <MenuItem key={option} value={option} dense={size === "small"}>
                {characterClass === "" ? (
                  option
                ) : (
                  <SpecOptionLabel
                    className={characterClass.name}
                    spec={option}
                  />
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label={t("characterForm.gearScore")}
          name={gearScoreName}
          value={gearScoreText}
          onChange={(event) => {
            onGearScoreTextChange(event.target.value);
          }}
          autoComplete="off"
          size={size}
          helperText={
            showHelperText ? t("characterForm.gearScoreHelper") : undefined
          }
          disabled={disabled}
          sx={{ flex: size === "small" ? "0 0 8.5rem" : 1, minWidth: 0 }}
        />
      </Stack>
    </Stack>
  );
}

export function CharacterSpecGearFields({
  characterClass,
  mainSpec,
  mainGearScoreText,
  offSpec,
  offGearScoreText,
  onMainSpecChange,
  onMainGearScoreTextChange,
  onOffSpecChange,
  onOffGearScoreTextChange,
  mainFooter,
  offFooter,
}: CharacterSpecGearFieldsProps) {
  const { t } = useTranslation();
  const classSpecs =
    characterClass === "" ? [] : specsForClass(characterClass.name);
  const specsDisabled = characterClass === "";

  return (
    <Stack spacing={2}>
      <Stack spacing={mainFooter ? 1.25 : 0.5}>
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
          onSpecChange={onMainSpecChange}
          onGearScoreTextChange={onMainGearScoreTextChange}
        />
        {mainFooter}
      </Stack>
      <Stack spacing={offFooter ? 1.25 : 0.5}>
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
          onSpecChange={onOffSpecChange}
          onGearScoreTextChange={onOffGearScoreTextChange}
        />
        {offFooter}
      </Stack>
    </Stack>
  );
}
