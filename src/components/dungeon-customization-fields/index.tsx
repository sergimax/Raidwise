import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {
  EMBLEM_OPTIONS,
  emblemIcons,
  type EmblemKey,
} from "../../assets/emblems/emblem-icons.ts";
import { MAX_DUNGEON_SHORT_NAME_LENGTH } from "../../constants/dungeon-form-defaults.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { getLocalizedDifficulty, getLocalizedEmblemLabel } from "../../i18n/localized-domain.ts";
import {
  defaultShortNameForDungeonName,
  difficultyForRaidName,
  raidNameForDifficulty,
} from "../../utils/dungeon-short-name.ts";
import {
  DungeonDifficulty,
  DungeonSizes,
  type DungeonDifficulty as DungeonDifficultyValue,
  type DungeonSize,
} from "../../types/dungeons.ts";

export type DungeonCustomizationFieldsProps = {
  name: string;
  shortName: string;
  size: DungeonSize;
  difficulty: DungeonDifficultyValue;
  emblem: EmblemKey | "";
  onNameChange: (name: string) => void;
  onShortNameChange: (shortName: string) => void;
  onSizeChange: (size: DungeonSize) => void;
  onDifficultyChange: (difficulty: DungeonDifficultyValue) => void;
  onEmblemChange: (emblem: EmblemKey | "") => void;
};

export function DungeonCustomizationFields({
  name,
  shortName,
  size,
  difficulty,
  emblem,
  onNameChange,
  onShortNameChange,
  onSizeChange,
  onDifficultyChange,
  onEmblemChange,
}: DungeonCustomizationFieldsProps) {
  const { t, locale } = useTranslation();

  return (
    <Stack spacing={2}>
      <TextField
        label={t("common.name")}
        name="dungeonName"
        value={name}
        onChange={(event) => {
          const nextName = event.target.value;
          onNameChange(nextName);
          const matchingDifficulty = difficultyForRaidName(nextName);
          if (matchingDifficulty) {
            onDifficultyChange(matchingDifficulty);
          }
          const shortName = defaultShortNameForDungeonName(nextName);
          if (shortName) {
            onShortNameChange(shortName);
          }
        }}
        required
        autoComplete="off"
      />
      <TextField
        label={t("dungeonForm.shortName")}
        name="dungeonShortName"
        value={shortName}
        onChange={(event) => {
          onShortNameChange(event.target.value);
        }}
        helperText={t("dungeonForm.shortNameHelper")}
        slotProps={{ htmlInput: { maxLength: MAX_DUNGEON_SHORT_NAME_LENGTH } }}
        autoComplete="off"
      />
      <FormControl required>
        <InputLabel id="dungeon-size-label">{t("common.size")}</InputLabel>
        <Select
          labelId="dungeon-size-label"
          label={t("common.size")}
          name="dungeonSize"
          value={size}
          onChange={(event) => {
            onSizeChange(Number(event.target.value) as DungeonSize);
          }}
        >
          {DungeonSizes.map((sizeOption) => (
            <MenuItem key={sizeOption} value={sizeOption}>
              {sizeOption}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <InputLabel id="dungeon-difficulty-label">{t("common.mode")}</InputLabel>
        <Select
          labelId="dungeon-difficulty-label"
          label={t("common.mode")}
          name="dungeonDifficulty"
          value={difficulty}
          onChange={(event) => {
            const nextDifficulty = event.target.value as DungeonDifficultyValue;
            const matchingName = raidNameForDifficulty(name, nextDifficulty, locale);
            if (matchingName && matchingName !== name) {
              onNameChange(matchingName);
              onShortNameChange(defaultShortNameForDungeonName(matchingName) ?? "");
            }
            onDifficultyChange(nextDifficulty);
          }}
        >
          <MenuItem value={DungeonDifficulty.NORMAL}>
            {getLocalizedDifficulty(DungeonDifficulty.NORMAL, locale)}
          </MenuItem>
          <MenuItem value={DungeonDifficulty.HEROIC}>
            {getLocalizedDifficulty(DungeonDifficulty.HEROIC, locale)}
          </MenuItem>
        </Select>
      </FormControl>
      <FormControl>
        <InputLabel id="dungeon-emblem-label">{t("dungeonForm.badge")}</InputLabel>
        <Select
          labelId="dungeon-emblem-label"
          label={t("dungeonForm.badge")}
          name="dungeonEmblem"
          value={emblem}
          onChange={(event) => {
            onEmblemChange(event.target.value as EmblemKey | "");
          }}
          renderValue={(selected) => {
            if (!selected) {
              return t("common.none");
            }
            return (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  component="img"
                  src={emblemIcons[selected]}
                  alt=""
                  sx={{ width: 18, height: 18, borderRadius: "4px" }}
                />
                <span>{getLocalizedEmblemLabel(selected, locale)}</span>
              </Stack>
            );
          }}
        >
          <MenuItem value="">
            <em>{t("common.none")}</em>
          </MenuItem>
          {EMBLEM_OPTIONS.map((emblemKey) => (
            <MenuItem key={emblemKey} value={emblemKey}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  component="img"
                  src={emblemIcons[emblemKey]}
                  alt=""
                  sx={{ width: 18, height: 18, borderRadius: "4px" }}
                />
                <span>{getLocalizedEmblemLabel(emblemKey, locale)}</span>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
