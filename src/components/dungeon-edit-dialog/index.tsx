import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import type { SubmitEvent } from "react";
import { useCallback, useState } from "react";
import type { EmblemKey } from "../../assets/emblems/emblem-icons.ts";
import { DungeonList } from "../../data/dungeon-list.ts";
import { RaidNames } from "../../data/raid-names.ts";
import { getLocalizedDifficulty, getLocalizedDungeonDisplayName } from "../../i18n/localized-domain.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import type {
  DungeonCustomizationUpdate,
  DungeonRecord,
  DungeonDifficulty as DungeonDifficultyValue,
  DungeonSize,
} from "../../types/dungeons.ts";
import {
  dungeonCustomizationFormValues,
  parseDungeonCustomizationForm,
} from "../../utils/validate-dungeon.ts";
import { DungeonCustomizationFields } from "../dungeon-customization-fields/index.tsx";
import { FormErrorMessage } from "../form-error-message/index.tsx";
import { resolveDungeonRaidKey } from "../../utils/resolve-dungeon-raid-key.ts";

const CUSTOM_VARIANT = "custom";
const LEGACY_VARIANT = "legacy";

type DungeonEditDialogProps = {
  dungeon: DungeonRecord | null;
  onClose: () => void;
  onSave: (dungeonId: string, customization: DungeonCustomizationUpdate) => void;
};

type DungeonEditDialogContentProps = {
  dungeon: DungeonRecord;
  onClose: () => void;
  onSave: (dungeonId: string, customization: DungeonCustomizationUpdate) => void;
};

function DungeonEditDialogContent({
  dungeon,
  onClose,
  onSave,
}: DungeonEditDialogContentProps) {
  const { t, locale } = useTranslation();
  const initialValues = dungeonCustomizationFormValues(dungeon);
  const [name, setName] = useState(initialValues.name);
  const [shortName, setShortName] = useState(initialValues.shortName);
  const [size, setSize] = useState<DungeonSize>(initialValues.size);
  const [difficulty, setDifficulty] = useState<DungeonDifficultyValue>(
    initialValues.difficulty,
  );
  const [emblem, setEmblem] = useState<EmblemKey | "">(initialValues.emblem);
  const [error, setError] = useState("");
  const originalRaidKey = resolveDungeonRaidKey(dungeon);
  const [variant, setVariant] = useState(() => {
    if (!originalRaidKey) return CUSTOM_VARIANT;
    const index = DungeonList.findIndex((row) => row.raidKey === originalRaidKey &&
      row.size === dungeon.size && row.difficulty === dungeon.difficulty);
    return index === -1 ? LEGACY_VARIANT : String(index);
  });
  const selectedTemplate = DungeonList[Number(variant)];
  const linkedVariant = variant === LEGACY_VARIANT ? dungeon : selectedTemplate;
  const raidKey = variant === LEGACY_VARIANT ? originalRaidKey ?? null : selectedTemplate?.raidKey ?? null;
  const selectedSize = linkedVariant?.size ?? size;
  const selectedDifficulty = linkedVariant?.difficulty ?? difficulty;

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");
      const result = parseDungeonCustomizationForm(
        {
          name,
          shortName,
          size: selectedSize,
          difficulty: selectedDifficulty,
          emblem,
        },
        locale,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSave(dungeon.id, { ...result.fields, raidKey });
      onClose();
    },
    [dungeon.id, emblem, locale, name, onClose, onSave, raidKey, selectedDifficulty, selectedSize, shortName],
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogTitle id="dungeon-edit-title">{t("dungeonEdit.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl>
            <InputLabel id="raid-loot-template-label">{t("dungeonEdit.lootTemplate")}</InputLabel>
            <Select
              labelId="raid-loot-template-label"
              label={t("dungeonEdit.lootTemplate")}
              value={variant}
              aria-describedby="raid-loot-template-help"
              onChange={(event) => {
                const nextVariant = event.target.value;
                const nextTemplate = DungeonList[Number(nextVariant)];
                if (nextTemplate && (!name.trim() ||
                    (raidKey && resolveDungeonRaidKey({ name }) === raidKey))) {
                  setName(getLocalizedDungeonDisplayName(nextTemplate, locale, false));
                  setShortName(getLocalizedDungeonDisplayName(nextTemplate, locale, true));
                }
                setVariant(nextVariant);
                setError("");
              }}
            >
              <MenuItem value={CUSTOM_VARIANT}>{t("dungeonEdit.noLootTemplate")}</MenuItem>
              {originalRaidKey && !DungeonList.some((row) => row.raidKey === originalRaidKey &&
                row.size === dungeon.size && row.difficulty === dungeon.difficulty) && (
                <MenuItem value={LEGACY_VARIANT}>
                  {t("dungeonEdit.keepLootTemplate", { raid: RaidNames[originalRaidKey][locale] })}
                </MenuItem>
              )}
              {DungeonList.map((row, index) => (
                <MenuItem key={index} value={String(index)}>
                  {getLocalizedDungeonDisplayName(row, locale, false)} · {row.size} · {getLocalizedDifficulty(row.difficulty, locale)}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText id="raid-loot-template-help">{t("dungeonEdit.lootTemplateHelp")}</FormHelperText>
          </FormControl>
          <DungeonCustomizationFields
            name={name}
            shortName={shortName}
            size={selectedSize}
            difficulty={selectedDifficulty}
            emblem={emblem}
            fixedVariant={Boolean(linkedVariant)}
            onNameChange={(value) => {
              setName(value);
              setError("");
            }}
            onShortNameChange={(value) => {
              setShortName(value);
              setError("");
            }}
            onSizeChange={(value) => {
              setSize(value);
              setError("");
            }}
            onDifficultyChange={(value) => {
              setDifficulty(value);
              setError("");
            }}
            onEmblemChange={(value) => {
              setEmblem(value);
              setError("");
            }}
          />
          {error ? <FormErrorMessage message={error} /> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button type="submit" variant="contained">
          {t("common.save")}
        </Button>
      </DialogActions>
    </form>
  );
}

export function DungeonEditDialog({
  dungeon,
  onClose,
  onSave,
}: DungeonEditDialogProps) {
  return (
    <Dialog open={dungeon !== null} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="dungeon-edit-title">
      {dungeon ? (
        <DungeonEditDialogContent
          key={dungeon.id}
          dungeon={dungeon}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </Dialog>
  );
}
