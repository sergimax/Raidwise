import GitHubIcon from "@mui/icons-material/GitHub";
import HomeIcon from "@mui/icons-material/Home";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";

const GITHUB_REPO_URL = "https://github.com/sergimax/Raidwise";
const AUTHOR_SITE_URL = "https://sergimax.ru";

export function AppVersionLabel() {
  const { t } = useTranslation();

  return (
    <Typography
      component="span"
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
    </Typography>
  );
}

export function AppMetaInfo() {
  const { t } = useTranslation();
  const githubHint = t("header.githubHint");
  const authorSiteAria = t("header.authorSiteAria");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.25,
      }}
    >
      <Tooltip title={githubHint}>
        <IconButton
          component="a"
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          color="inherit"
          aria-label={githubHint}
        >
          <GitHubIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={authorSiteAria}>
        <IconButton
          component="a"
          href={AUTHOR_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          color="inherit"
          aria-label={authorSiteAria}
        >
          <HomeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
