import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

type AppIntroToggleProps = {
  introVisible: boolean;
  onToggle: () => void;
};

/** Header control to show/hide the usage-help intro panel. */
export function AppIntroToggle({
  introVisible,
  onToggle,
}: AppIntroToggleProps) {
  const { t } = useTranslation();
  const label = introVisible
    ? t("header.introHideAria")
    : t("header.introShowAria");

  return (
    <Tooltip title={label}>
      <IconButton
        size="small"
        color="inherit"
        onClick={onToggle}
        aria-label={label}
        aria-pressed={introVisible}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
