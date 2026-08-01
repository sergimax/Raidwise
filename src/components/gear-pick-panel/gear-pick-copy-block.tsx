import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import type { TranslateFn } from "../../i18n/translate.ts";

type GearPickCopyBlockProps = {
  copyText: string;
  hasSoftCalls: boolean;
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
  copyText,
  hasSoftCalls,
  t,
}: GearPickCopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!hasSoftCalls) {
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
  }, [copyText, hasSoftCalls]);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 1.25,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minHeight: 0,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          <Box
            component="span"
            sx={{ color: "text.secondary", fontWeight: 700, mr: 0.5 }}
          >
            5.
          </Box>
          {t("gearPickPanel.copyTitle")}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ContentCopyIcon fontSize="small" />}
          disabled={!hasSoftCalls}
          aria-label={t("gearPickPanel.copyLineAria")}
          onClick={() => {
            void handleCopy();
          }}
        >
          {copied ? t("gearPickPanel.copied") : t("gearPickPanel.copyLine")}
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {t("gearPickPanel.copyHelper")}
      </Typography>
      {hasSoftCalls ? (
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
            flex: 1,
            overflow: "auto",
          }}
        >
          {copyText}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t("gearPickPanel.copyEmpty")}
        </Typography>
      )}
    </Box>
  );
}
