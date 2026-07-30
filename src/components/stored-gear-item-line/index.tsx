import { Box, Typography } from "@mui/material";
import type { CharacterGearItem } from "../../types/character-gear.ts";
import { useTranslation } from "../../i18n/use-translation.ts";
import { getLocalizedGearSlotLabel } from "../../i18n/localized-domain.ts";
import { formatStoredGearItemLevelLabel } from "../../utils/format-stored-gear.ts";
import { WowItemLink } from "../wow-item-link/index.tsx";

type StoredGearItemLineProps = {
  item: CharacterGearItem;
};

const mutedMetaSx = { color: "text.secondary" } as const;

export function StoredGearItemLine({ item }: StoredGearItemLineProps) {
  const { locale } = useTranslation();

  return (
    <Box component="span" sx={{ display: "inline" }}>
      <Typography component="span" variant="body2" sx={mutedMetaSx}>
        {getLocalizedGearSlotLabel(item.slot, locale)}
        {" · "}
      </Typography>
      <WowItemLink itemId={item.id} />
      <Typography component="span" variant="body2" sx={mutedMetaSx}>
        {" · "}
        {formatStoredGearItemLevelLabel(item, locale)}
      </Typography>
    </Box>
  );
}
