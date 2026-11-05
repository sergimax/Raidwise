import { Link, Tooltip } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

const GITHUB_REPO_URL = "https://github.com/sergimax/Raidwise";

export function AppVersionLabel() {
  const { t } = useTranslation();

  return (
    <Tooltip title={t("header.githubHint")} describeChild>
      <Link
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        variant="caption"
        color="text.secondary"
        aria-label={t("header.versionAria", { version: __APP_VERSION__ })}
        sx={{
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          display: "inline-block",
        }}
      >
        v.{__APP_VERSION__}
      </Link>
    </Tooltip>
  );
}

export function AppAboutLinks() {
  const { t } = useTranslation();

  return (
    <Link
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{ alignSelf: "flex-start" }}
    >
      {t("appSettings.sourceCode")}
    </Link>
  );
}
