import { Box, Typography } from "@mui/material";
import type { AppLocale } from "../../i18n/types.ts";
import { getBisItemSourceText } from "../../utils/bis-item-sources.ts";
import { useTranslation } from "../../i18n/use-translation.ts";

type BisItemDropSourcesProps = {
  itemIds: readonly number[];
  locale: AppLocale;
};

export function BisItemDropSources({ itemIds, locale }: BisItemDropSourcesProps) {
  const { t } = useTranslation();
  const sourceLines = itemIds.flatMap((itemId) => {
    const sources = getBisItemSourceText(itemId, locale, t);
    if (sources.length === 0) {
      return [];
    }
    return [{ itemId, sources }];
  });

  if (sourceLines.length === 0) {
    return null;
  }

  return (
    <Box component="span" sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      {sourceLines.map(({ itemId, sources }) => (
        <Typography
          key={itemId}
          variant="caption"
          component="span"
          sx={{ display: "block", color: "text.disabled", lineHeight: 1.35 }}
        >
          {sources}
        </Typography>
      ))}
    </Box>
  );
}
