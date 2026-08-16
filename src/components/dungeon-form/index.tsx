import {
  Autocomplete,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useMemo, type SyntheticEvent } from "react";
import { MAX_DUNGEON_SHORT_NAME_LENGTH } from "../../constants/dungeon-form-defaults.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { getLocalizedDifficulty } from "../../i18n/localized-domain.ts";
import {
  defaultShortNameForDungeonName,
  getLocalizedRaidNameSuggestions,
  isKnownRaidName,
} from "../../utils/dungeon-short-name.ts";
import {
  DungeonDifficulty,
  DungeonSizes,
  type DungeonDifficulty as DungeonDifficultyValue,
  type DungeonSize,
} from "../../types/dungeons.ts";
import { FilterSection } from "../filter-unit/filter-section.tsx";
import { FormActionsRow } from "../form-actions-row/index.tsx";
import { FormErrorMessage } from "../form-error-message/index.tsx";
import {
  FILTER_UNIT_GRID_GAP_SPACING,
  getDungeonFormGridTemplateAreas,
  getDungeonFormGridTemplateColumns,
} from "./constants.ts";
import type { DungeonFormProps } from "./types.ts";

const dungeonOverflowVisibleContentSx = { overflow: "visible" } as const;

export function DungeonForm({
  name,
  shortName,
  size,
  itemLevelText,
  difficulty,
  error,
  onNameChange,
  onShortNameChange,
  onSizeChange,
  onItemLevelTextChange,
  onDifficultyChange,
  onSubmit,
}: DungeonFormProps) {
  const { t, locale } = useTranslation();
  const optionalMark = t("common.optional");
  const nameSuggestions = useMemo(
    () => getLocalizedRaidNameSuggestions(locale),
    [locale],
  );

  const handleNameInputChange = (
    _event: SyntheticEvent,
    nextName: string,
  ) => {
    onNameChange(nextName);
  };

  const handleNameChange = (
    _event: SyntheticEvent,
    nextName: string | null,
  ) => {
    if (nextName == null) {
      return;
    }
    onNameChange(nextName);
    if (isKnownRaidName(nextName)) {
      onShortNameChange(defaultShortNameForDungeonName(nextName) ?? "");
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: getDungeonFormGridTemplateColumns(),
            },
            gridTemplateAreas: {
              xs: `
                "name"
                "shortName"
                "type"
                "itemLevels"
              `,
              md: getDungeonFormGridTemplateAreas(),
            },
            gap: FILTER_UNIT_GRID_GAP_SPACING,
            alignItems: "stretch",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <Box sx={{ gridArea: "name", minWidth: 0, minHeight: 0 }}>
            <FilterSection
              step={1}
              title={t("dungeonForm.stepName")}
              description={t("dungeonForm.nameHelper")}
              contentSx={dungeonOverflowVisibleContentSx}
            >
              <Autocomplete
                freeSolo
                options={nameSuggestions}
                inputValue={name}
                onInputChange={handleNameInputChange}
                onChange={handleNameChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("common.name")}
                    name="dungeonName"
                    required
                    autoComplete="off"
                    size="small"
                  />
                )}
              />
            </FilterSection>
          </Box>

          <Box sx={{ gridArea: "shortName", minWidth: 0, minHeight: 0 }}>
            <FilterSection
              step={2}
              title={t("dungeonForm.stepShortName")}
              titleMark={optionalMark}
              description={t("dungeonForm.shortNameHelper")}
              contentSx={dungeonOverflowVisibleContentSx}
            >
              <TextField
                label={t("dungeonForm.shortName")}
                name="dungeonShortName"
                value={shortName}
                onChange={(event) => {
                  onShortNameChange(event.target.value);
                }}
                size="small"
                slotProps={{
                  htmlInput: { maxLength: MAX_DUNGEON_SHORT_NAME_LENGTH },
                }}
                autoComplete="off"
                fullWidth
              />
            </FilterSection>
          </Box>

          <Box sx={{ gridArea: "type", minWidth: 0, minHeight: 0 }}>
            <FilterSection
              step={3}
              title={t("dungeonForm.stepType")}
              description={t("dungeonForm.typeHelper")}
              contentSx={dungeonOverflowVisibleContentSx}
            >
              <Stack spacing={1.25}>
                <FormControl required size="small" fullWidth>
                  <InputLabel id="dungeon-size-label">
                    {t("common.size")}
                  </InputLabel>
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
                <FormControl size="small" fullWidth>
                  <InputLabel id="dungeon-difficulty-label">
                    {t("dungeonForm.difficulty")}
                  </InputLabel>
                  <Select
                    labelId="dungeon-difficulty-label"
                    label={t("dungeonForm.difficulty")}
                    name="dungeonDifficulty"
                    value={difficulty}
                    onChange={(event) => {
                      onDifficultyChange(
                        event.target.value as DungeonDifficultyValue,
                      );
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
              </Stack>
            </FilterSection>
          </Box>

          <Box sx={{ gridArea: "itemLevels", minWidth: 0, minHeight: 0 }}>
            <FilterSection
              step={4}
              title={t("dungeonForm.stepItemLevels")}
              description={t("dungeonForm.itemLevelsHelper")}
              contentSx={dungeonOverflowVisibleContentSx}
            >
              <TextField
                label={t("dungeonForm.itemLevels")}
                name="dungeonItemLevels"
                value={itemLevelText}
                onChange={(event) => {
                  onItemLevelTextChange(event.target.value);
                }}
                required
                autoComplete="off"
                size="small"
                fullWidth
              />
            </FilterSection>
          </Box>
        </Box>

        <FormActionsRow submitLabel={t("dungeonForm.addDungeon")} />
        {error ? <FormErrorMessage message={error} /> : null}
      </Stack>
    </form>
  );
}
