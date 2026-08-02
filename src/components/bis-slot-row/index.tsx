import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { memo, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "../../i18n/use-translation.ts";
import { getLocalizedGearSlotLabel } from "../../i18n/localized-domain.ts";
import { validateBisSlotItemsText } from "../../utils/bis-lists.ts";
import {
  isSlotDraftDirty,
  type BisSlotDraft,
} from "../../utils/bis-list-editor.ts";
import type { CharacterEquipContext } from "../../utils/item-equip-restrictions.ts";
import { BisItemDropSources } from "../bis-item-drop-sources/index.tsx";
import { GearSlotIcon } from "../gear-slot-icon/index.tsx";
import { WowItemLink } from "../wow-item-link/index.tsx";

const slotRowSx = {
  display: "grid",
  gridTemplateColumns: "6.25rem minmax(0, 1fr) auto",
  columnGap: 1,
  alignItems: "start",
  py: 0.375,
  minHeight: 32,
} as const;

const slotViewContentSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  alignSelf: "center",
  gap: 0.5,
  py: 0.5,
  fontSize: "0.8125rem",
  lineHeight: 1.35,
} as const;

export type BisSlotRowProps = {
  slotIndex: number;
  slotDraft: BisSlotDraft;
  validationError?: string;
  isEditing: boolean;
  readOnly: boolean;
  equipContext: CharacterEquipContext;
  onItemsTextChange: (slotIndex: number, slot: number, nextValue: string) => void;
  onItemsTextBlur: (slot: number, itemsText: string) => void;
  onConfirm: (slotIndex: number) => void;
  onStartEdit: (slot: number) => void;
  onCancelEdit: (slotIndex: number) => void;
  onClearSlot: (slotIndex: number) => void;
};

function areBisSlotRowPropsEqual(
  previous: BisSlotRowProps,
  next: BisSlotRowProps,
): boolean {
  return (
    previous.slotIndex === next.slotIndex &&
    previous.slotDraft === next.slotDraft &&
    previous.validationError === next.validationError &&
    previous.isEditing === next.isEditing &&
    previous.readOnly === next.readOnly &&
    previous.equipContext === next.equipContext &&
    previous.onItemsTextChange === next.onItemsTextChange &&
    previous.onItemsTextBlur === next.onItemsTextBlur &&
    previous.onConfirm === next.onConfirm &&
    previous.onStartEdit === next.onStartEdit &&
    previous.onCancelEdit === next.onCancelEdit &&
    previous.onClearSlot === next.onClearSlot
  );
}

export const BisSlotRow = memo(function BisSlotRow({
  slotIndex,
  slotDraft,
  validationError,
  isEditing,
  readOnly,
  equipContext,
  onItemsTextChange,
  onItemsTextBlur,
  onConfirm,
  onStartEdit,
  onCancelEdit,
  onClearSlot,
}: BisSlotRowProps) {
  const { t, locale } = useTranslation();
  const slotLabel = getLocalizedGearSlotLabel(slotDraft.slot, locale);
  const inputRef = useRef<HTMLInputElement>(null);

  const canConfirm = useMemo(() => {
    if (!isEditing || validationError) {
      return false;
    }
    if (!isSlotDraftDirty(slotDraft)) {
      return false;
    }
    return (
      validateBisSlotItemsText(
        slotDraft.slot,
        slotDraft.itemsText,
        "strict",
        equipContext,
      ).error === undefined
    );
  }, [equipContext, isEditing, slotDraft, validationError]);

  const canClearSlot =
    isEditing &&
    (slotDraft.itemIds.length > 0 || slotDraft.itemsText.trim() !== "");

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const showActionsColumn = isEditing || !readOnly;
  // Tall alternative stacks: pin icon + content to the top together.
  // Single-item view: keep both vertically centered (original alignment).
  const pinSlotBlockToTop = isEditing || slotDraft.itemIds.length > 1;

  return (
    <Box
      sx={{
        ...slotRowSx,
        gridTemplateColumns: showActionsColumn
          ? slotRowSx.gridTemplateColumns
          : "6.25rem minmax(0, 1fr)",
      }}
    >
      <Box
        sx={{
          pt: isEditing ? 0.75 : 0,
          alignSelf: pinSlotBlockToTop ? "start" : "center",
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <GearSlotIcon slot={slotDraft.slot} />
      </Box>

      {isEditing ? (
        <TextField
          inputRef={inputRef}
          size="small"
          fullWidth
          value={slotDraft.itemsText}
          onChange={(event) => {
            onItemsTextChange(slotIndex, slotDraft.slot, event.target.value);
          }}
          onBlur={(event) => {
            onItemsTextBlur(slotDraft.slot, event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canConfirm) {
              event.preventDefault();
              onConfirm(slotIndex);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onCancelEdit(slotIndex);
            }
          }}
          placeholder={t("bisPanel.itemSearchPlaceholder")}
          error={Boolean(validationError)}
          helperText={validationError ?? t("bisPanel.confirmHelper")}
          slotProps={{
            input: {
              sx: { py: 0.75, fontSize: "0.8125rem" },
            },
            formHelperText: {
              sx: { mx: 0, mt: 0.25, lineHeight: 1.3 },
            },
          }}
        />
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          component="div"
          sx={{
            ...slotViewContentSx,
            alignSelf: pinSlotBlockToTop ? "start" : "center",
          }}
        >
          {slotDraft.itemIds.length === 0 ? (
            "—"
          ) : (
            <>
              <Box
                component="span"
                sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}
              >
                <WowItemLink itemId={slotDraft.itemIds[0]} />
                <BisItemDropSources
                  itemIds={[slotDraft.itemIds[0]]}
                  locale={locale}
                />
              </Box>
              {slotDraft.itemIds.length > 1 ? (
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.25,
                    pl: 1,
                    borderLeft: 1,
                    borderColor: "divider",
                    mt: 0.25,
                  }}
                >
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{ color: "text.disabled", lineHeight: 1.3 }}
                  >
                    {t("bisPanel.alternatives")}
                  </Typography>
                  {slotDraft.itemIds.slice(1).map((itemId, altIndex) => (
                    <WowItemLink
                      key={`${itemId}-${altIndex}`}
                      itemId={itemId}
                    />
                  ))}
                </Box>
              ) : null}
            </>
          )}
        </Typography>
      )}

      {isEditing ? (
        <Stack direction="row" spacing={0.25} sx={{ mt: 0.25, alignSelf: "start" }}>
          <Tooltip title={t("bisPanel.cancelEditing")}>
            <IconButton
              size="small"
              aria-label={t("bisPanel.cancelEditingAria", { slot: slotLabel })}
              onClick={() => {
                onCancelEdit(slotIndex);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("bisPanel.clearSlot")}>
            <span>
              <IconButton
                size="small"
                aria-label={t("bisPanel.clearSlotAria", { slot: slotLabel })}
                onClick={() => {
                  onClearSlot(slotIndex);
                }}
                disabled={!canClearSlot}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t("bisPanel.confirmItem")}>
            <span>
              <IconButton
                size="small"
                aria-label={t("bisPanel.confirmItemAria", { slot: slotLabel })}
                onClick={() => {
                  onConfirm(slotIndex);
                }}
                disabled={!canConfirm}
                color="primary"
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ) : (
        readOnly ? null : (
          <Tooltip title={t("bisPanel.editSlot")}>
            <IconButton
              size="small"
              aria-label={t("bisPanel.editSlotAria", { slot: slotLabel })}
              onClick={() => {
                onStartEdit(slotDraft.slot);
              }}
              sx={{ alignSelf: "center" }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      )}
    </Box>
  );
}, areBisSlotRowPropsEqual);
