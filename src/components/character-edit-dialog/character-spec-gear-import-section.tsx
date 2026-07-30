import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import type { ItemTooltipLocale } from "../../constants/item-tooltips.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import type { CharacterClass } from "../../types/characters.ts";
import type { CharacterGearItem } from "../../types/character-gear.ts";
import {
  formatGearSummary,
  sortGearItemsBySlot,
} from "../../utils/format-stored-gear.ts";
import { summarizeGearItemLevels } from "../../utils/summarize-gear-item-levels.ts";
import { parseWowSimsExporterJson } from "../../utils/parse-wowsims-exporter.ts";
import { SpecOptionLabel } from "../spec-option-label/index.tsx";
import { StoredGearItemLine } from "../stored-gear-item-line/index.tsx";

type CharacterSpecGearImportSectionProps = {
  label: string;
  spec?: string;
  characterClass: CharacterClass;
  gearItems: CharacterGearItem[] | undefined;
  onGearItemsChange: (gearItems: CharacterGearItem[] | undefined) => void;
  onError: (message: string) => void;
  onClearError: () => void;
  locale: ItemTooltipLocale;
  t: TranslateFn;
  hideHeader?: boolean;
  compact?: boolean;
};

export function CharacterSpecGearImportSection({
  label,
  spec,
  characterClass,
  gearItems,
  onGearItemsChange,
  onError,
  onClearError,
  locale,
  t,
  hideHeader = false,
  compact = false,
}: CharacterSpecGearImportSectionProps) {
  const [wowsimsImportText, setWowsimsImportText] = useState("");
  const [importNotice, setImportNotice] = useState("");

  const storedGearSummary = useMemo(() => {
    if (!gearItems || gearItems.length === 0) {
      return null;
    }
    return summarizeGearItemLevels(gearItems);
  }, [gearItems]);

  const sortedGearItems = useMemo(
    () => (gearItems ? sortGearItemsBySlot(gearItems) : []),
    [gearItems],
  );

  const handleClearGear = useCallback(() => {
    onClearError();
    setImportNotice("");
    setWowsimsImportText("");
    onGearItemsChange(undefined);
  }, [onClearError, onGearItemsChange]);

  const handleImportGear = useCallback(() => {
    onClearError();
    setImportNotice("");

    const result = parseWowSimsExporterJson(
      wowsimsImportText,
      characterClass.name,
      locale,
    );
    if (!result.ok) {
      onError(result.error);
      return;
    }

    onGearItemsChange(result.gearItems);

    const noticeParts = [
      t("characterEdit.importedSummary", {
        summary: formatGearSummary(result.gearItems, locale),
      }),
    ];
    if (result.exportSpec) {
      noticeParts.push(
        t("characterEdit.importedSpec", { spec: result.exportSpec }),
      );
    }
    if (result.warnings.length > 0) {
      noticeParts.push(result.warnings.join(" "));
    }
    setImportNotice(noticeParts.join(" "));
    setWowsimsImportText("");
  }, [
    characterClass.name,
    locale,
    onClearError,
    onError,
    onGearItemsChange,
    t,
    wowsimsImportText,
  ]);

  const fieldSize = compact ? "small" : "medium";
  const listVariant = compact ? "caption" : "body2";

  return (
    <Stack spacing={compact ? 0.75 : 1}>
      {!hideHeader ? (
        spec ? (
          <SpecOptionLabel
            className={characterClass.name}
            spec={spec}
            variant="body2"
            iconSize={20}
          />
        ) : (
          <Typography variant="subtitle2">{label}</Typography>
        )
      ) : null}
      {storedGearSummary ? (
        <Stack spacing={0.5}>
          <Typography
            variant={compact ? "caption" : "body2"}
            color="text.secondary"
          >
            {t("characterEdit.storedGear")}
            {storedGearSummary.averageItemLevel !== undefined
              ? t("characterEdit.avgIlvl", {
                  ilvl: storedGearSummary.averageItemLevel,
                })
              : ""}
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 2.25,
              maxHeight: compact ? 168 : 160,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: compact ? 0.35 : 0.25,
            }}
          >
            {sortedGearItems.map((item) => (
              <Typography
                key={`${item.slot}-${item.id}`}
                component="li"
                variant="body2"
                sx={{ lineHeight: 1.45 }}
              >
                <StoredGearItemLine item={item} />
              </Typography>
            ))}
          </Box>
          {storedGearSummary.unknownItemIds.length > 0 ? (
            <Typography variant="caption" color="warning.main">
              {t("characterEdit.unknownItemIds", {
                count: storedGearSummary.unknownItemIds.length,
              })}
            </Typography>
          ) : null}
        </Stack>
      ) : null}
      <TextField
        label={t("characterEdit.wseJson")}
        value={wowsimsImportText}
        onChange={(event) => {
          setWowsimsImportText(event.target.value);
          onClearError();
          setImportNotice("");
        }}
        size={fieldSize}
        placeholder={compact ? undefined : t("characterEdit.wsePlaceholder")}
        helperText={compact ? undefined : t("characterEdit.wseHelper")}
        fullWidth
      />
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: "wrap", alignItems: "center" }}
      >
        <Button
          type="button"
          variant="outlined"
          size={fieldSize}
          onClick={handleImportGear}
          disabled={wowsimsImportText.trim() === ""}
        >
          {t("characterEdit.importButton")}
        </Button>
        {storedGearSummary ? (
          <Button
            type="button"
            variant="outlined"
            color="error"
            size={fieldSize}
            onClick={handleClearGear}
          >
            {t("characterEdit.clearGearButton")}
          </Button>
        ) : null}
        {compact ? (
          <Typography variant="caption" color="text.secondary">
            {t("characterEdit.wseHelper")}
          </Typography>
        ) : null}
      </Stack>
      {importNotice ? (
        <Typography variant={listVariant} color="success.main">
          {importNotice}
        </Typography>
      ) : null}
    </Stack>
  );
}
