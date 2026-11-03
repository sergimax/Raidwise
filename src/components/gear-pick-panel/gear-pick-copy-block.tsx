import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, Button, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useWowDataReady } from "../../hooks/use-wow-data-ready.ts";
import type { GearPickCopyPart } from "../../utils/gear-pick-soft-roll.ts";
import { wowItemLinkColor } from "../wow-item-link/item-link-styles.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import { FilterSection } from "../filter-unit/filter-section.tsx";
import { GearPickCopyFormatActions } from "./gear-pick-copy-format-actions.tsx";

type GearPickCopyBlockProps = {
  copyParts: readonly GearPickCopyPart[];
  hasCopyItems: boolean;
  includeCharacterName: boolean;
  includeSpec: boolean;
  includeSoftCount: boolean;
  includeAllItems: boolean;
  includeAllBisItems: boolean;
  compactLines: boolean;
  onIncludeCharacterNameChange: (includeCharacterName: boolean) => void;
  onIncludeSpecChange: (includeSpec: boolean) => void;
  onIncludeSoftCountChange: (includeSoftCount: boolean) => void;
  onIncludeAllItemsChange: (includeAllItems: boolean) => void;
  onIncludeAllBisItemsChange: (value: boolean) => void;
  onCompactLinesChange: (compactLines: boolean) => void;
  t: TranslateFn;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function GearPickCopyBlock({
  copyParts,
  hasCopyItems,
  includeCharacterName,
  includeSpec,
  includeSoftCount,
  includeAllItems,
  includeAllBisItems,
  compactLines,
  onIncludeCharacterNameChange,
  onIncludeSpecChange,
  onIncludeSoftCountChange,
  onIncludeAllItemsChange,
  onIncludeAllBisItemsChange,
  onCompactLinesChange,
  t,
}: GearPickCopyBlockProps) {
  useWowDataReady();
  const [copied, setCopied] = useState(false);
  const copyText = copyParts.map(({ text }) => text).join("");

  const handleCopy = useCallback(async () => {
    if (!hasCopyItems) {
      return;
    }
    const didCopy = await copyTextToClipboard(copyText);
    if (!didCopy) {
      return;
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, [copyText, hasCopyItems]);

  return (
    <FilterSection
      step={5}
      title={t("gearPickPanel.copyTitle")}
      description={t("gearPickPanel.copyHelper")}
      titleActions={
        <Button
          size="small"
          variant="outlined"
          startIcon={<ContentCopyIcon fontSize="small" />}
          disabled={!hasCopyItems}
          aria-label={t("gearPickPanel.copyLineAria")}
          onClick={() => {
            void handleCopy();
          }}
        >
          {copied ? t("gearPickPanel.copied") : t("gearPickPanel.copyLine")}
        </Button>
      }
      descriptionActions={
        <GearPickCopyFormatActions
          includeCharacterName={includeCharacterName}
          includeSpec={includeSpec}
          includeSoftCount={includeSoftCount}
          includeAllItems={includeAllItems}
          includeAllBisItems={includeAllBisItems}
          compactLines={compactLines}
          onIncludeCharacterNameChange={onIncludeCharacterNameChange}
          onIncludeSpecChange={onIncludeSpecChange}
          onIncludeSoftCountChange={onIncludeSoftCountChange}
          onIncludeAllItemsChange={onIncludeAllItemsChange}
          onIncludeAllBisItemsChange={onIncludeAllBisItemsChange}
          onCompactLinesChange={onCompactLinesChange}
        />
      }
    >
      {hasCopyItems ? (
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1,
            borderRadius: 1,
            bgcolor: "action.hover",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "inherit",
            fontSize: "0.875rem",
            lineHeight: 1.45,
            minHeight: 0,
            overflow: "auto",
          }}
        >
          {copyParts.map(({ text, itemId }, index) => (
            <Box
              component="span"
              key={index}
              sx={itemId != null ? (theme) => ({
                color: wowItemLinkColor(itemId, theme.palette.mode),
              }) : undefined}
            >
              {text}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t(includeAllBisItems ? "gearPickPanel.copyEmptyBis" : includeAllItems ? "gearPickPanel.copyEmptyAll" : "gearPickPanel.copyEmpty")}
        </Typography>
      )}
    </FilterSection>
  );
}
