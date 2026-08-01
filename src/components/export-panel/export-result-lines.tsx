import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Button,
  Stack,
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
import { useExportPanelSideBySide } from "./use-export-panel-side-by-side.ts";

type ExportResultLinesProps = {
  result: BuildExportStatusResult;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

type ExportResultLineRowProps = {
  line: ExportStatusLine;
  emphasizeCopy: boolean;
};

function ExportResultLineRow({ line, emphasizeCopy }: ExportResultLineRowProps) {
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        gap: 1.25,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        px: 1.25,
        py: 1,
        minWidth: 0,
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
        sx={{
          flexShrink: 0,
          alignSelf: { xs: "stretch", sm: "center" },
          whiteSpace: "nowrap",
        }}
      >
        {copied ? t("exportPanel.copied") : t("exportPanel.copyLine")}
      </Button>
      <Box
        sx={{
          flexShrink: 0,
          alignSelf: { xs: "flex-start", sm: "center" },
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: "action.hover",
          border: 1,
          borderColor: "divider",
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
      <Typography
        variant="body2"
        component="p"
        sx={{
          flex: 1,
          minWidth: 0,
          lineHeight: 1.4,
          wordBreak: "break-word",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {line.charactersLabel}
      </Typography>
    </Box>
  );
}

export function ExportResultLines({ result }: ExportResultLinesProps) {
  const { t } = useTranslation();
  const sideBySide = useExportPanelSideBySide();

  const sectionLayoutSx = sideBySide
    ? { width: "100%", height: "100%", minHeight: 0, flex: 1 }
    : { width: "100%", height: "auto" };

  const sectionContentSx = sideBySide
    ? { flex: 1, minHeight: 0, maxHeight: "none" }
    : { maxHeight: EXPORT_RESULT_MAX_HEIGHT };

  if (result.kind === "message") {
    return (
      <ExportFilterSection
        step={5}
        title={t("exportPanel.exportLinesTitle")}
        description={t("exportPanel.exportLinesHelper")}
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
      sx={sectionLayoutSx}
      contentSx={sectionContentSx}
    >
      <Stack spacing={1}>
        {result.lines.map((line) => (
          <ExportResultLineRow
            key={line.dungeonId}
            line={line}
            emphasizeCopy={singleLine}
          />
        ))}
      </Stack>
    </ExportFilterSection>
  );
}
