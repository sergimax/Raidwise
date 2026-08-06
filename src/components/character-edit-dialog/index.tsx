import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { SubmitEvent } from "react";
import { useCallback, useState, useEffect } from "react";
import type { CharacterGearItem } from "../../types/character-gear.ts";
import type { CharacterRecord, CharacterSpecGearUpdate } from "../../types/characters.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  characterSpecGearFormValues,
  parseCharacterSpecGearFields,
} from "../../utils/validate-character.ts";
import { characterNameDisplaySx, formatCharacterDisplayName } from "../../utils/character-display.ts";
import { hideExternalWowTooltips } from "../../utils/hide-external-wow-tooltips.ts";
import { ClassOptionLabel } from "../class-option-label/index.tsx";
import { FormErrorMessage } from "../form-error-message/index.tsx";
import { CharacterAlsoOwnedGearSection } from "./character-also-owned-gear-section.tsx";
import { CharacterSpecGearColumn } from "./character-spec-gear-column.tsx";
import { CharacterTableOrderControl } from "./character-table-order-section.tsx";
import {
  attachGearToSpec,
  gearItemsForSpecSave,
  initialGearLoadedForSpec,
  initialSpecGearSyncBaseline,
  specGearSyncBaselineAfterSpecChange,
} from "./character-edit-spec-gear.ts";

type CharacterEditDialogProps = {
  character: CharacterRecord | null;
  characters: CharacterRecord[];
  onClose: () => void;
  onSave: (characterId: string, specGear: CharacterSpecGearUpdate) => void;
  onMoveCharacter: (characterId: string, direction: -1 | 1) => void;
};

type CharacterEditDialogContentProps = {
  character: CharacterRecord;
  characters: CharacterRecord[];
  onClose: () => void;
  onSave: (characterId: string, specGear: CharacterSpecGearUpdate) => void;
  onMoveCharacter: (characterId: string, direction: -1 | 1) => void;
};

function CharacterEditDialogContent({
  character,
  characters,
  onClose,
  onSave,
  onMoveCharacter,
}: CharacterEditDialogContentProps) {
  const { t, locale } = useTranslation();
  const initialValues = characterSpecGearFormValues(character);
  const [mainSpec, setMainSpec] = useState(initialValues.mainSpec);
  const [mainGearScoreText, setMainGearScoreText] = useState(
    initialValues.mainGearScoreText,
  );
  const [offSpec, setOffSpec] = useState(initialValues.offSpec);
  const [offGearScoreText, setOffGearScoreText] = useState(
    initialValues.offGearScoreText,
  );
  const [mainGearItems, setMainGearItems] = useState<
    CharacterGearItem[] | undefined
  >(character.mainSpec?.gearItems);
  const [mainGearLoadedForSpec, setMainGearLoadedForSpec] = useState(() =>
    initialGearLoadedForSpec(character.mainSpec),
  );
  const [offGearItems, setOffGearItems] = useState<
    CharacterGearItem[] | undefined
  >(character.offSpec?.gearItems);
  const [offGearLoadedForSpec, setOffGearLoadedForSpec] = useState(() =>
    initialGearLoadedForSpec(character.offSpec),
  );
  const [mainSyncBaseline, setMainSyncBaseline] = useState(() =>
    initialSpecGearSyncBaseline(
      character.mainSpec,
      initialValues.mainSpec,
      initialValues.mainGearScoreText,
    ),
  );
  const [offSyncBaseline, setOffSyncBaseline] = useState(() =>
    initialSpecGearSyncBaseline(
      character.offSpec,
      initialValues.offSpec,
      initialValues.offGearScoreText,
    ),
  );
  const [alsoOwnedItemIds, setAlsoOwnedItemIds] = useState<number[]>(
    () => character.alsoOwnedItemIds ?? [],
  );
  const [error, setError] = useState("");

  useEffect(() => () => hideExternalWowTooltips(), []);

  const handleMainSpecChange = useCallback((value: string) => {
    if (value !== mainSpec) {
      setMainSyncBaseline(specGearSyncBaselineAfterSpecChange(mainGearScoreText));
    }
    setMainSpec(value);
    if (value !== mainGearLoadedForSpec) {
      setMainGearItems(undefined);
      setMainGearLoadedForSpec("");
    }
    setError("");
  }, [mainGearLoadedForSpec, mainGearScoreText, mainSpec]);

  const handleOffSpecChange = useCallback((value: string) => {
    if (value !== offSpec) {
      setOffSyncBaseline(specGearSyncBaselineAfterSpecChange(offGearScoreText));
    }
    setOffSpec(value);
    if (value !== offGearLoadedForSpec) {
      setOffGearItems(undefined);
      setOffGearLoadedForSpec("");
    }
    setError("");
  }, [offGearLoadedForSpec, offGearScoreText, offSpec]);

  const handleMainGearItemsChange = useCallback(
    (gearItems: CharacterGearItem[] | undefined) => {
      setMainGearItems(gearItems);
      setMainGearLoadedForSpec(
        gearItems && gearItems.length > 0 ? mainSpec : "",
      );
    },
    [mainSpec],
  );

  const handleOffGearItemsChange = useCallback(
    (gearItems: CharacterGearItem[] | undefined) => {
      setOffGearItems(gearItems);
      setOffGearLoadedForSpec(
        gearItems && gearItems.length > 0 ? offSpec : "",
      );
    },
    [offSpec],
  );

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!character.class) {
        return;
      }
      setError("");
      const result = parseCharacterSpecGearFields(
        { mainSpec, mainGearScoreText, offSpec, offGearScoreText },
        character.class,
        locale,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSave(character.id, {
        mainSpec: attachGearToSpec(
          result.mainSpec,
          gearItemsForSpecSave(
            result.mainSpec?.spec,
            mainGearItems,
            mainGearLoadedForSpec,
          ),
        ),
        offSpec: attachGearToSpec(
          result.offSpec,
          gearItemsForSpecSave(
            result.offSpec?.spec,
            offGearItems,
            offGearLoadedForSpec,
          ),
        ),
        alsoOwnedItemIds,
      });
      onClose();
    },
    [
      alsoOwnedItemIds,
      character.class,
      character.id,
      locale,
      mainGearItems,
      mainGearLoadedForSpec,
      mainGearScoreText,
      mainSpec,
      offGearItems,
      offGearLoadedForSpec,
      offGearScoreText,
      offSpec,
      onClose,
      onSave,
    ],
  );

  const mainSpecLabel = t("characterEdit.mainSpecGear");
  const offSpecLabel = t("characterEdit.offSpecGear");

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          columnGap: 1.5,
          rowGap: 0.75,
          pb: 1.25,
        }}
      >
        <Typography component="span" variant="h6">
          {t("characterEdit.title")}
        </Typography>
        <Divider
          flexItem
          orientation="vertical"
          sx={{ alignSelf: "stretch", my: 0.25 }}
        />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1,
            columnGap: 1.25,
            minHeight: 32,
          }}
        >
          <Typography
            component="span"
            variant="subtitle1"
            sx={{
              ...characterNameDisplaySx(character.class),
              lineHeight: 1.2,
            }}
          >
            {formatCharacterDisplayName(character.name)}
          </Typography>
          {character.class ? (
            <ClassOptionLabel
              characterClass={character.class}
              variant="body2"
              iconSize={16}
            />
          ) : null}
        </Box>
        <CharacterTableOrderControl
          character={character}
          characters={characters}
          onMove={(direction) => onMoveCharacter(character.id, direction)}
          t={t}
        />
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.25}>
          {character.class ? (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 1.5, md: 2 }}
              divider={
                <Divider
                  flexItem
                  orientation="vertical"
                  sx={{ display: { xs: "none", md: "block" } }}
                />
              }
              sx={{ alignItems: "stretch" }}
            >
              <CharacterSpecGearColumn
                roleLabel={t("characterForm.main")}
                importSectionLabel={mainSpecLabel}
                spec={mainSpec}
                gearScoreText={mainGearScoreText}
                initialGearScoreText={mainSyncBaseline.gearScoreText}
                specName="mainSpec"
                gearScoreName="mainGearScore"
                specLabelId="character-main-spec-label"
                characterClass={character.class}
                gearItems={mainGearItems}
                initialGearItems={mainSyncBaseline.gearItems}
                onSpecChange={handleMainSpecChange}
                onGearScoreTextChange={(value) => {
                  setMainGearScoreText(value);
                  setError("");
                }}
                onGearItemsChange={handleMainGearItemsChange}
                onError={setError}
                onClearError={() => setError("")}
                locale={locale}
                t={t}
              />
              <CharacterSpecGearColumn
                roleLabel={t("characterForm.off")}
                importSectionLabel={offSpecLabel}
                spec={offSpec}
                gearScoreText={offGearScoreText}
                initialGearScoreText={offSyncBaseline.gearScoreText}
                specName="offSpec"
                gearScoreName="offGearScore"
                specLabelId="character-off-spec-label"
                characterClass={character.class}
                gearItems={offGearItems}
                initialGearItems={offSyncBaseline.gearItems}
                onSpecChange={handleOffSpecChange}
                onGearScoreTextChange={(value) => {
                  setOffGearScoreText(value);
                  setError("");
                }}
                onGearItemsChange={handleOffGearItemsChange}
                onError={setError}
                onClearError={() => setError("")}
                locale={locale}
                t={t}
              />
            </Stack>
          ) : null}
          <Divider />
          <CharacterAlsoOwnedGearSection
            itemIds={alsoOwnedItemIds}
            onItemIdsChange={setAlsoOwnedItemIds}
            onError={setError}
            onClearError={() => setError("")}
            locale={locale}
            t={t}
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

export function CharacterEditDialog({
  character,
  characters,
  onClose,
  onSave,
  onMoveCharacter,
}: CharacterEditDialogProps) {
  return (
    <Dialog open={character !== null} onClose={onClose} maxWidth="lg" fullWidth>
      {character ? (
        <CharacterEditDialogContent
          key={character.id}
          character={character}
          characters={characters}
          onClose={onClose}
          onSave={onSave}
          onMoveCharacter={onMoveCharacter}
        />
      ) : null}
    </Dialog>
  );
}
