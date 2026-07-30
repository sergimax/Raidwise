import { Box, Typography } from "@mui/material";
import type { CharacterGearItem } from "../../types/character-gear.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { getLocalizedGearSlotLabel } from "../../i18n/localized-domain.ts";
import { formatStoredGearItemLevelLabel } from "../../utils/format-stored-gear.ts";
import { WowItemLink } from "../wow-item-link/index.tsx";

type StoredGearItemLineProps = {
  item: CharacterGearItem;
  dense?: boolean;
};

const mutedMetaSx = { color: "text.secondary" } as const;

export function StoredGearItemLine({ item, dense = false }: StoredGearItemLineProps) {
  const { locale } = useTranslation();
  const metaVariant = dense ? "caption" : "body2";

  return (
    <Box component="span" sx={{ display: "inline" }}>
      <Typography component="span" variant={metaVariant} sx={mutedMetaSx}>
        {getLocalizedGearSlotLabel(item.slot, locale)}
        {" · "}
      </Typography>
      <WowItemLink itemId={item.id} />
      <Typography component="span" variant={metaVariant} sx={mutedMetaSx}>
        {" · "}
        {formatStoredGearItemLevelLabel(item, locale)}
      </Typography>
    </Box>
  );
}
