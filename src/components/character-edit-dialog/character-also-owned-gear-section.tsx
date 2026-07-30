import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import type { ItemTooltipLocale } from "../../constants/item-tooltips.ts";
import { getWotlkItemLevel } from "../../data/wotlk-item-levels.ts";
import { getWotlkItemName } from "../../data/wotlk-item-names.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import { WowItemLink } from "../wow-item-link/index.tsx";

type CharacterAlsoOwnedGearSectionProps = {
  itemIds: readonly number[];
  onItemIdsChange: (itemIds: number[]) => void;
  onError: (message: string) => void;
  onClearError: () => void;
  locale: ItemTooltipLocale;
  t: TranslateFn;
};

function parseItemIdInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const itemId = Number(trimmed);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return null;
  }
  return itemId;
}

export function CharacterAlsoOwnedGearSection({
  itemIds,
  onItemIdsChange,
  onError,
  onClearError,
  locale,
  t,
}: CharacterAlsoOwnedGearSectionProps) {
  const [itemIdText, setItemIdText] = useState("");

  const handleAdd = useCallback(() => {
    onClearError();

    const itemId = parseItemIdInput(itemIdText);
    if (itemId === null) {
      onError(t("characterEdit.alsoOwnedInvalidId"));
      return;
    }

    if (
      getWotlkItemName(itemId, locale) === undefined &&
      getWotlkItemLevel(itemId) === undefined
    ) {
      onError(t("characterEdit.alsoOwnedUnknownId"));
      return;
    }

    if (itemIds.includes(itemId)) {
      onError(t("characterEdit.alsoOwnedDuplicate"));
      return;
    }

    onItemIdsChange([...itemIds, itemId]);
    setItemIdText("");
  }, [
    itemIdText,
    itemIds,
    locale,
    onClearError,
    onError,
    onItemIdsChange,
    t,
  ]);

  const handleRemove = useCallback(
    (itemId: number) => {
      onClearError();
      onItemIdsChange(itemIds.filter((ownedId) => ownedId !== itemId));
    },
    [itemIds, onClearError, onItemIdsChange],
  );

  const handleClear = useCallback(() => {
    onClearError();
    onItemIdsChange([]);
    setItemIdText("");
  }, [onClearError, onItemIdsChange]);

  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle2">
        {t("characterEdit.alsoOwnedTitle")}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {t("characterEdit.alsoOwnedHelper")}
      </Typography>
      {itemIds.length > 0 ? (
        <Box
          component="ul"
          sx={{
            m: 0,
            pl: 0,
            listStyle: "none",
            maxHeight: 140,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
          }}
        >
          {itemIds.map((itemId) => (
            <Box
              key={itemId}
              component="li"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                minHeight: 28,
              }}
            >
              <Typography
                component="span"
                variant="body2"
                sx={{ flex: 1, minWidth: 0, lineHeight: 1.45 }}
              >
                <WowItemLink itemId={itemId} />
              </Typography>
              <IconButton
                type="button"
                size="small"
                aria-label={t("characterEdit.alsoOwnedRemoveAria", {
                  id: itemId,
                })}
                onClick={() => handleRemove(itemId)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          {t("characterEdit.alsoOwnedEmpty")}
        </Typography>
      )}
      <TextField
        label={t("characterEdit.alsoOwnedItemId")}
        value={itemIdText}
        onChange={(event) => {
          setItemIdText(event.target.value);
          onClearError();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleAdd();
          }
        }}
        size="small"
        sx={{ width: 140 }}
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
          size="small"
          onClick={() => handleAdd()}
          disabled={itemIdText.trim() === ""}
        >
          {t("characterEdit.alsoOwnedAdd")}
        </Button>
        {itemIds.length > 0 ? (
          <Button
            type="button"
            variant="outlined"
            color="error"
            size="small"
            onClick={handleClear}
          >
            {t("characterEdit.alsoOwnedClear")}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
