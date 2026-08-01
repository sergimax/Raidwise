import { TextField } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type DungeonNameSearchFieldProps = {
  value: string;
  onChange: (query: string) => void;
  /** Defaults to table search styles so panel + header inputs match. */
  className?: string;
  fullWidth?: boolean;
};

/** Shared dungeon/raid name search (table header + Character pick / Soft pick). */
export function DungeonNameSearchField({
  value,
  onChange,
  className = "raid-tracker-table__dungeon-search",
  fullWidth = true,
}: DungeonNameSearchFieldProps) {
  const { t } = useTranslation();

  return (
    <TextField
      className={className}
      size="small"
      placeholder={t("table.dungeonSearchPlaceholder")}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
      slotProps={{
        htmlInput: {
          "aria-label": t("table.filterByDungeonName"),
          title: t("table.filterByDungeonName"),
        },
      }}
      fullWidth={fullWidth}
    />
  );
}
