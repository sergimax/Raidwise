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
import { EXPORT_RESULT_MAX_HEIGHT } from "./constants.ts";
import { ExportFilterSection } from "./export-filter-section.tsx";
import { ExportRaidIcon } from "./export-raid-icon.tsx";
import { ExportResultFormatActions } from "./export-result-format-actions.tsx";
import { useExportPanelSideBySide } from "./use-export-panel-side-by-side.ts";

type ExportResultLinesProps = {
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

type ExportResultLineRowProps = {
  line: ExportStatusLine;
  emphasizeCopy: boolean;
  isLast: boolean;
};

function ExportResultLineRow({
  line,
  emphasizeCopy,
  isLast,
}: ExportResultLineRowProps) {
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
          <ExportRaidIcon raidKey={line.raidKey} />
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
          aria-label={t("exportPanel.copyLineAria", { raid: line.raidLabel })}
          sx={{ whiteSpace: "nowrap" }}
        >
          {copied ? t("exportPanel.copied") : t("exportPanel.copyLine")}
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

export function ExportResultLines({
  result,
  includeSpecs,
  includeGearScore,
  onIncludeSpecsChange,
  onIncludeGearScoreChange,
}: ExportResultLinesProps) {
  const { t } = useTranslation();
  const sideBySide = useExportPanelSideBySide();

  const sectionLayoutSx = sideBySide
    ? { width: "100%", height: "100%", minHeight: 0, flex: 1 }
    : { width: "100%", height: "auto" };

  const sectionContentSx = sideBySide
    ? { flex: 1, minHeight: 0, maxHeight: "none" }
    : { maxHeight: EXPORT_RESULT_MAX_HEIGHT };

  const descriptionActions = (
    <ExportResultFormatActions
      includeSpecs={includeSpecs}
      includeGearScore={includeGearScore}
      onIncludeSpecsChange={onIncludeSpecsChange}
      onIncludeGearScoreChange={onIncludeGearScoreChange}
    />
  );

  if (result.kind === "message") {
    return (
      <ExportFilterSection
        step={5}
        title={t("exportPanel.exportLinesTitle")}
        description={t("exportPanel.exportLinesHelper")}
        descriptionActions={descriptionActions}
        sx={sectionLayoutSx}
        contentSx={sectionContentSx}
      >
        <Typography variant="body2" color="text.secondary">
          {result.message}
        </Typography>
      </ExportFilterSection>
    );
  }

  const singleLine = result.lines.length === 1;

  return (
    <ExportFilterSection
      step={5}
      title={t("exportPanel.exportLinesTitle")}
      description={
        singleLine
          ? t("exportPanel.exportLinesHelperSingle")
          : t("exportPanel.exportLinesHelper")
      }
      descriptionActions={descriptionActions}
      sx={sectionLayoutSx}
      contentSx={sectionContentSx}
    >
      <Table
        size="small"
        aria-label={t("exportPanel.exportLinesTitle")}
        sx={{
          width: "100%",
          tableLayout: "auto",
          borderCollapse: "collapse",
        }}
      >
        <TableBody>
          {result.lines.map((line, index) => (
            <ExportResultLineRow
              key={line.dungeonId}
              line={line}
              emphasizeCopy={singleLine}
              isLast={index === result.lines.length - 1}
            />
          ))}
        </TableBody>
      </Table>
    </ExportFilterSection>
  );
}
