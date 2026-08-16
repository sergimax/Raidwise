import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "../../i18n/use-translation.ts";
import {
  formatExportLineCopyText,
  type BuildExportStatusResult,
  type ExportStatusLine,
} from "../../utils/build-export-status.ts";
import { CHARACTER_PICK_RESULT_MAX_HEIGHT } from "./constants.ts";
import { FilterSection } from "../filter-unit/filter-section.tsx";
import { RaidIcon } from "../filter-unit/raid-icon.tsx";
import { CharacterPickResultFormatActions } from "./result-format-actions.tsx";
import { useCharacterPickPanelSideBySide } from "./use-character-pick-panel-side-by-side.ts";

type CharacterPickResultLinesProps = {
  result: BuildExportStatusResult;
  includeSpecs: boolean;
  includeGearScore: boolean;
  onIncludeSpecsChange: (includeSpecs: boolean) => void;
  onIncludeGearScoreChange: (includeGearScore: boolean) => void;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const resultTableCellSx = {
  borderBottom: 1,
  borderColor: "divider",
  verticalAlign: "middle",
  py: 0.75,
  px: 0.5,
} as const;

type CharacterPickResultLineRowProps = {
  line: ExportStatusLine;
  emphasizeCopy: boolean;
  isLast: boolean;
};

function CharacterPickResultLineRow({
  line,
  emphasizeCopy,
  isLast,
}: CharacterPickResultLineRowProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const didCopy = await copyTextToClipboard(formatExportLineCopyText(line));
    if (!didCopy) {
      return;
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }, [line]);

  const cellSx = {
    ...resultTableCellSx,
    ...(isLast ? { borderBottom: 0 } : null),
  };

  return (
    <TableRow>
      <TableCell
        sx={{
          ...cellSx,
          // Shrink-wrap so all raid labels share one column width.
          width: "1%",
          whiteSpace: "nowrap",
          pl: 0.25,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            minWidth: 0,
          }}
        >
          <RaidIcon raidKey={line.raidKey} />
          <Typography
            variant="body2"
            component="span"
            sx={{ fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap" }}
          >
            {line.raidLabel}
          </Typography>
        </Box>
      </TableCell>
      <TableCell
        sx={{
          ...cellSx,
          width: "1%",
          whiteSpace: "nowrap",
        }}
      >
        <Button
          size="small"
          variant={emphasizeCopy ? "contained" : "outlined"}
          startIcon={<ContentCopyIcon fontSize="small" />}
          onClick={() => {
            void handleCopy();
          }}
          aria-label={t("characterPickPanel.copyLineAria", { raid: line.raidLabel })}
          sx={{ whiteSpace: "nowrap" }}
        >
          {copied ? t("characterPickPanel.copied") : t("characterPickPanel.copyLine")}
        </Button>
      </TableCell>
      <TableCell sx={{ ...cellSx, width: "100%", pr: 0.25 }}>
        <Typography
          variant="body2"
          component="p"
          sx={{
            m: 0,
            minWidth: 0,
            lineHeight: 1.4,
            wordBreak: "break-word",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {line.charactersLabel}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export function CharacterPickResultLines({
  result,
  includeSpecs,
  includeGearScore,
  onIncludeSpecsChange,
  onIncludeGearScoreChange,
}: CharacterPickResultLinesProps) {
  const { t } = useTranslation();
  const sideBySide = useCharacterPickPanelSideBySide();

  const sectionLayoutSx = sideBySide
    ? { width: "100%", height: "100%", minHeight: 0, flex: 1 }
    : { width: "100%", height: "auto" };

  const sectionContentSx = sideBySide
    ? { flex: 1, minHeight: 0, maxHeight: "none" }
    : { maxHeight: CHARACTER_PICK_RESULT_MAX_HEIGHT };

  const descriptionActions = (
    <CharacterPickResultFormatActions
      includeSpecs={includeSpecs}
      includeGearScore={includeGearScore}
      onIncludeSpecsChange={onIncludeSpecsChange}
      onIncludeGearScoreChange={onIncludeGearScoreChange}
    />
  );

  if (result.kind === "message") {
    return (
      <FilterSection
        step={5}
        title={t("characterPickPanel.exportLinesTitle")}
        description={t("characterPickPanel.exportLinesHelper")}
        descriptionActions={descriptionActions}
        sx={sectionLayoutSx}
        contentSx={sectionContentSx}
      >
        <Typography variant="body2" color="text.secondary">
          {result.message}
        </Typography>
      </FilterSection>
    );
  }

  const singleLine = result.lines.length === 1;

  return (
    <FilterSection
      step={5}
      title={t("characterPickPanel.exportLinesTitle")}
      description={
        singleLine
          ? t("characterPickPanel.exportLinesHelperSingle")
          : t("characterPickPanel.exportLinesHelper")
      }
      descriptionActions={descriptionActions}
      sx={sectionLayoutSx}
      contentSx={sectionContentSx}
    >
      <Table
        size="small"
        aria-label={t("characterPickPanel.exportLinesTitle")}
        sx={{
          width: "100%",
          tableLayout: "auto",
          borderCollapse: "collapse",
        }}
      >
        <TableBody>
          {result.lines.map((line, index) => (
            <CharacterPickResultLineRow
              key={line.dungeonId}
              line={line}
              emphasizeCopy={singleLine}
              isLast={index === result.lines.length - 1}
            />
          ))}
        </TableBody>
      </Table>
    </FilterSection>
  );
}
