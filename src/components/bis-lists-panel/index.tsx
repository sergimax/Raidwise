import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { specsForClass } from "../../data/class-specs.ts";
import {
  BIS_PAPER_DOLL_BOTTOM_SLOTS,
  getBisPaperDollArmorPairs,
  type BisPaperDollRow,
} from "../../data/bis-paper-doll-slots.ts";
import type { TranslateFn } from "../../i18n/translate.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  getLocalizedClassName,
  getLocalizedSpecName,
} from "../../i18n/localized-domain.ts";
import { useBisListsContext } from "../../hooks/use-bis-lists-context.ts";
import { useBisListsEditorState } from "../../hooks/use-bis-lists-editor-state.ts";
import {
  BIS_LISTS_STORAGE_QUOTA_MESSAGE,
  BIS_LISTS_STORAGE_SAVE_FAILED_MESSAGE,
} from "../../storage/bis-lists/index.ts";
import { Classes, ClassName, type ClassName as ClassNameType } from "../../types/characters.ts";
import {
  hasBuiltInBisForSpec,
  isLocalBisPreset,
} from "../../utils/bis-lists.ts";
import { isSlotEditing, type BisSlotDraft } from "../../utils/bis-list-editor.ts";
import { formatBisListCopyText } from "../../utils/format-bis-list-copy.ts";
import type { CharacterEquipContext } from "../../utils/item-equip-restrictions.ts";
import { hideExternalWowTooltips } from "../../utils/hide-external-wow-tooltips.ts";
import { BisSlotRow } from "../bis-slot-row/index.tsx";
import { ClassOptionLabel } from "../class-option-label/index.tsx";
import { ExportFilterSection } from "../export-panel/export-filter-section.tsx";
import { FormErrorMessage } from "../form-error-message/index.tsx";
import { SpecOptionLabel } from "../spec-option-label/index.tsx";
import { BisCosmeticSlotRow } from "./bis-cosmetic-slot-row.tsx";
import {
  BIS_ITEMS_CONTENT_MAX_HEIGHT_XS_PX,
  getBisItemsContentMaxHeight,
  getBisListsContentMaxHeight,
} from "./constants.ts";

function localizeBisStorageMessage(message: string, t: TranslateFn): string {
  if (message === BIS_LISTS_STORAGE_QUOTA_MESSAGE) {
    return t("storage.quotaExceeded");
  }
  if (message === BIS_LISTS_STORAGE_SAVE_FAILED_MESSAGE) {
    return t("storage.saveFailed");
  }
  return message;
}

const bisClassSpecSelectSx = {
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    pr: "2rem !important",
  },
} as const;

const bisOverflowVisibleContentSx = { overflow: "visible" } as const;

const bisItemsContentSx = {
  maxHeight: {
    xs: BIS_ITEMS_CONTENT_MAX_HEIGHT_XS_PX,
    md: getBisItemsContentMaxHeight(),
  },
  overflowY: "auto",
} as const;

const bisListsContentSx = {
  maxHeight: getBisListsContentMaxHeight(),
  overflowY: "auto",
  pr: 0.25,
} as const;

export function BisListsPanel() {
  const { t, locale } = useTranslation();
  const bisLists = useBisListsContext();
  const [className, setClassName] = useState<ClassNameType>(ClassName.DeathKnight);
  const [spec, setSpec] = useState("Unholy");

  const classSpecs = useMemo(() => specsForClass(className), [className]);
  const activeSpec = classSpecs.includes(spec) ? spec : (classSpecs[0] ?? "");
  const presets = useMemo(
    () => bisLists.getPresetsForSpec(className, activeSpec),
    [activeSpec, bisLists, className],
  );
  const selectedPreset = useMemo(
    () => bisLists.getSelectedPreset(className, activeSpec),
    [activeSpec, bisLists, className],
  );
  const hasBuiltIn = hasBuiltInBisForSpec(className, activeSpec);
  const isCustomListCreation = !hasBuiltIn && presets.length === 0;
  const selectedPresetId = selectedPreset?.id;
  const isBuiltInPresetSelected = Boolean(
    selectedPreset && !isLocalBisPreset(selectedPreset),
  );
  const editorSessionKey = `${className}:${activeSpec}:${selectedPresetId ?? "none"}`;
  const optionalMark = t("common.optional");

  const equipContext = useMemo<CharacterEquipContext>(
    () => ({ className, spec: activeSpec }),
    [activeSpec, className],
  );

  const editor = useBisListsEditorState({
    editorSessionKey,
    className,
    activeSpec,
    selectedPreset,
    isBuiltInPresetSelected,
    equipContext,
    bisLists,
  });
  const {
    slotDrafts,
    slotErrors,
    editingSlots,
    saveListName,
    setSaveListName,
    error,
    clearError,
    hasSlotErrors,
    hasUnconfirmedSlots,
    handleConfirmSlot,
    handleStartEditSlot,
    handleCancelEditSlot,
    handleClearSlot,
    handleClearAllSlots,
    handleSaveList,
    handleItemsTextChange,
    handleItemsTextBlur,
  } = editor;

  const canClearAllSlots =
    !isBuiltInPresetSelected &&
    slotDrafts.some(
      (slotDraft) =>
        slotDraft.itemIds.length > 0 || slotDraft.itemsText.trim() !== "",
    );

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      bisLists.selectPreset(className, activeSpec, presetId);
      clearError();
    },
    [activeSpec, bisLists, className, clearError],
  );

  const handleDeleteLocalPreset = useCallback(
    (presetId: string) => {
      bisLists.deleteLocalPreset(className, activeSpec, presetId);
      clearError();
    },
    [activeSpec, bisLists, className, clearError],
  );

  const [listCopied, setListCopied] = useState(false);

  const copyListText = useMemo(
    () =>
      formatBisListCopyText({
        slots: slotDrafts.map((slotDraft) => ({
          slot: slotDraft.slot,
          itemIds: slotDraft.itemIds,
        })),
        locale,
      }),
    [locale, slotDrafts],
  );

  const handleCopyList = useCallback(async () => {
    if (!copyListText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(copyListText);
    } catch {
      return;
    }
    setListCopied(true);
    window.setTimeout(() => {
      setListCopied(false);
    }, 1500);
  }, [copyListText]);

  useEffect(() => () => hideExternalWowTooltips(), []);

  const slotDraftBySlot = useMemo(() => {
    const bySlot = new Map<number, { draft: BisSlotDraft; index: number }>();
    for (const [index, draft] of slotDrafts.entries()) {
      bySlot.set(draft.slot, { draft, index });
    }
    return bySlot;
  }, [slotDrafts]);

  const renderGearSlotRow = useCallback(
    (slot: number) => {
      const entry = slotDraftBySlot.get(slot);
      if (!entry) {
        return null;
      }
      return (
        <BisSlotRow
          key={slot}
          slotIndex={entry.index}
          slotDraft={entry.draft}
          validationError={slotErrors[entry.draft.slot]}
          isEditing={isSlotEditing(
            entry.draft,
            editingSlots,
            isBuiltInPresetSelected,
          )}
          readOnly={isBuiltInPresetSelected}
          equipContext={equipContext}
          onItemsTextChange={handleItemsTextChange}
          onItemsTextBlur={handleItemsTextBlur}
          onConfirm={handleConfirmSlot}
          onStartEdit={handleStartEditSlot}
          onCancelEdit={handleCancelEditSlot}
          onClearSlot={handleClearSlot}
        />
      );
    },
    [
      editingSlots,
      equipContext,
      handleCancelEditSlot,
      handleClearSlot,
      handleConfirmSlot,
      handleItemsTextBlur,
      handleItemsTextChange,
      handleStartEditSlot,
      isBuiltInPresetSelected,
      slotDraftBySlot,
      slotErrors,
    ],
  );

  const renderPaperDollCell = useCallback(
    (row: BisPaperDollRow) =>
      row.kind === "cosmetic" ? (
        <BisCosmeticSlotRow cosmeticId={row.id} />
      ) : (
        renderGearSlotRow(row.slot)
      ),
    [renderGearSlotRow],
  );

  const armorPairs = useMemo(() => getBisPaperDollArmorPairs(), []);

  const listsDescription = isCustomListCreation
    ? t("bisPanel.listsHelperCustom", {
        class: getLocalizedClassName(className, locale),
        spec: getLocalizedSpecName(className, activeSpec, locale),
      })
    : t("bisPanel.listsHelper");

  const itemsDescription = isBuiltInPresetSelected
    ? t("bisPanel.itemsHelperBuiltin")
    : t("bisPanel.itemsHelperEdit");

  const itemsTitleActions = (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
      {!isBuiltInPresetSelected ? (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={!canClearAllSlots}
          aria-label={t("bisPanel.clearAllSlotsAria")}
          onClick={handleClearAllSlots}
        >
          {t("bisPanel.clearAllSlots")}
        </Button>
      ) : null}
      <Button
        size="small"
        variant="outlined"
        startIcon={<ContentCopyIcon fontSize="small" />}
        disabled={!copyListText}
        aria-label={t("bisPanel.copyListAria")}
        onClick={() => {
          void handleCopyList();
        }}
      >
        {listCopied ? t("bisPanel.copied") : t("bisPanel.copyList")}
      </Button>
    </Stack>
  );

  const saveListForm = (
    <Stack spacing={1}>
      <TextField
        size="small"
        label={t("bisPanel.listName")}
        value={saveListName}
        onChange={(event) => {
          setSaveListName(event.target.value);
          clearError();
        }}
        placeholder={t("bisPanel.listNamePlaceholder")}
        fullWidth
      />
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={handleSaveList}
        disabled={hasSlotErrors || hasUnconfirmedSlots}
        fullWidth
      >
        {t("bisPanel.saveList")}
      </Button>
    </Stack>
  );

  const slotEditor = slotDrafts.length === 0 ? null : (
    <Box sx={{ pr: 0.5, minWidth: 0 }}>
      <Table
        size="small"
        sx={{
          width: "100%",
          tableLayout: "fixed",
          borderCollapse: "separate",
          borderSpacing: 0,
          "& .MuiTableCell-root": {
            borderBottom: "none",
            verticalAlign: "top",
            px: { xs: 0.5, sm: 1 },
            py: 0,
            width: "50%",
          },
        }}
      >
        <TableBody>
          {armorPairs.map((pair) => (
            <TableRow
              key={
                pair.left.kind === "cosmetic"
                  ? `cosmetic-${pair.left.id}`
                  : `gear-${pair.left.slot}`
              }
            >
              <TableCell>{renderPaperDollCell(pair.left)}</TableCell>
              <TableCell>{renderPaperDollCell(pair.right)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          columnGap: 2,
          rowGap: 0,
          mt: 1,
          pt: 0.5,
          borderTop: 1,
          borderColor: "divider",
          minWidth: 0,
        }}
      >
        {BIS_PAPER_DOLL_BOTTOM_SLOTS.map((slot) => renderGearSlotRow(slot))}
      </Box>
    </Box>
  );

  return (
    <Stack spacing={1.25}>
      {bisLists.storageError ? (
        <Alert severity="error">
          {localizeBisStorageMessage(bisLists.storageError, t)}
        </Alert>
      ) : null}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "14rem minmax(0, 1fr) 13rem",
            lg: "16rem minmax(0, 1fr) 14.5rem",
          },
          gap: { xs: 1.5, md: 2 },
          alignItems: "start",
        }}
      >
        <Stack spacing={1.5} sx={{ minWidth: 0 }}>
          <ExportFilterSection
            step={1}
            title={t("bisPanel.classAndSpec")}
            description={t("bisPanel.classAndSpecHelper")}
            contentSx={bisOverflowVisibleContentSx}
          >
            <Stack spacing={1.25}>
              <FormControl size="small" fullWidth>
                <InputLabel id="bis-class-label">{t("common.class")}</InputLabel>
                <Select
                  labelId="bis-class-label"
                  label={t("common.class")}
                  value={className}
                  sx={bisClassSpecSelectSx}
                  renderValue={(selectedName) => {
                    const selectedClass = Classes.find(
                      (option) => option.name === selectedName,
                    );
                    if (!selectedClass) {
                      return selectedName;
                    }
                    return <ClassOptionLabel characterClass={selectedClass} />;
                  }}
                  onChange={(event) => {
                    const nextClass = event.target.value as ClassNameType;
                    setClassName(nextClass);
                    setSpec(specsForClass(nextClass)[0] ?? "");
                    clearError();
                  }}
                >
                  {Classes.map((characterClass) => (
                    <MenuItem key={characterClass.name} value={characterClass.name}>
                      <ClassOptionLabel characterClass={characterClass} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel id="bis-spec-label">{t("common.spec")}</InputLabel>
                <Select
                  labelId="bis-spec-label"
                  label={t("common.spec")}
                  value={activeSpec}
                  sx={bisClassSpecSelectSx}
                  renderValue={(selectedSpec) => (
                    <SpecOptionLabel className={className} spec={selectedSpec} />
                  )}
                  onChange={(event) => {
                    setSpec(event.target.value);
                    clearError();
                  }}
                >
                  {classSpecs.map((specName) => (
                    <MenuItem key={specName} value={specName}>
                      <SpecOptionLabel className={className} spec={specName} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </ExportFilterSection>

          <ExportFilterSection
            step={2}
            title={t("bisPanel.lists")}
            description={listsDescription}
            contentSx={bisListsContentSx}
          >
            {isCustomListCreation ? (
              <Typography variant="caption" color="text.secondary">
                {t("bisPanel.localListsOnly")}
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                {presets.map((preset) => {
                  const isSelected = preset.id === selectedPresetId;
                  const isLocal = isLocalBisPreset(preset);
                  const isBuiltIn = !isLocal;

                  return (
                    <Chip
                      key={preset.id}
                      icon={isBuiltIn ? <LockOutlinedIcon /> : undefined}
                      label={preset.name}
                      variant={isSelected ? "filled" : "outlined"}
                      color={isSelected ? (isBuiltIn ? "secondary" : "primary") : "default"}
                      onClick={() => handleSelectPreset(preset.id)}
                      onDelete={isLocal ? () => handleDeleteLocalPreset(preset.id) : undefined}
                      sx={{
                        width: "100%",
                        justifyContent: "flex-start",
                        pl: isBuiltIn ? 0.5 : undefined,
                        ...(isBuiltIn && {
                          borderStyle: isSelected ? "solid" : "dashed",
                          opacity: isSelected ? 1 : 0.88,
                        }),
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    />
                  );
                })}
                {!hasBuiltIn ? (
                  <Typography variant="caption" color="text.secondary">
                    {t("bisPanel.localListsOnly")}
                  </Typography>
                ) : null}
              </Stack>
            )}
          </ExportFilterSection>
        </Stack>

        <ExportFilterSection
          step={3}
          title={t("bisPanel.items")}
          description={itemsDescription}
          titleActions={itemsTitleActions}
          contentSx={bisItemsContentSx}
        >
          {slotEditor}
        </ExportFilterSection>

        <ExportFilterSection
          step={4}
          title={t("bisPanel.saveTitle")}
          titleMark={optionalMark}
          description={t("bisPanel.saveHelper")}
          contentSx={bisOverflowVisibleContentSx}
        >
          {saveListForm}
        </ExportFilterSection>
      </Box>

      {error ? <FormErrorMessage message={error} /> : null}
    </Stack>
  );
}
