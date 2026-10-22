import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import changelog from "../../../CHANGELOG.md?raw";
import { useTranslation } from "../../i18n/use-translation.ts";
import { AppHeader } from "../app-header/index.tsx";
import { AppBreadcrumbs } from "../app-breadcrumbs/index.tsx";
import { AppAboutLinks } from "../app-meta-info/index.tsx";

type ChangeEntry = {
  category: string;
  text: string;
};

type ChangeRelease = {
  version: string;
  changes: ChangeEntry[];
};

function getRecentReleases(markdown: string, limit: number): ChangeRelease[] {
  const releases: ChangeRelease[] = [];
  let currentRelease: ChangeRelease | null = null;
  let category = "";

  for (const line of markdown.split(/\r?\n/)) {
    const release = line.match(/^## \[([^\]]+)\]/);
    if (release) {
      if (currentRelease?.changes.length) {
        releases.push(currentRelease);
        if (releases.length === limit) break;
      }
      currentRelease = release[1] === "Unreleased" ? null : { version: release[1], changes: [] };
      category = "";
      continue;
    }

    const section = line.match(/^###\s+(.+)$/);
    if (section) {
      category = section[1];
      continue;
    }

    const change = line.match(/^\s*[-*+]\s+(.+)$/);
    if (change && currentRelease && category) {
      currentRelease.changes.push({ category, text: change[1] });
    }
  }

  if (currentRelease?.changes.length && releases.length < limit) releases.push(currentRelease);
  return releases;
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={index}>{bold[1]}</strong>;

    const code = part.match(/^`(.+)`$/);
    if (code) return <code key={index}>{code[1]}</code>;

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={index} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }

    return part;
  });
}

const recentReleases = getRecentReleases(changelog, 10);
const GITHUB_CHANGELOG_URL = "https://github.com/sergimax/Raidwise/blob/main/CHANGELOG.md";

export function AppSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <AppHeader />
      <Container className="app-page-main" component="main" maxWidth="md" sx={{ pb: 3 }}>
        <AppBreadcrumbs />
        <Stack spacing={3}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {t("appSettings.title")}
          </Typography>

          <Box component="section" aria-labelledby="app-info-title">
            <Stack spacing={1.5}>
              <Typography id="app-info-title" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                {t("appSettings.appInfo")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("header.versionAria", { version: __APP_VERSION__ })}
              </Typography>
              <AppAboutLinks />
            </Stack>
          </Box>

          <Box component="section" aria-labelledby="app-whats-new-title">
            <Stack spacing={1.5}>
              <Box>
                <Typography id="app-whats-new-title" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                  {t("appSettings.whatsNew")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("appSettings.latestChanges")}
                </Typography>
              </Box>
              {recentReleases.map((release) => (
                <Paper component="article" variant="outlined" key={release.version} sx={{ p: 1.5 }}>
                  <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }}>
                    {release.version}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {release.changes.map((entry, index) => (
                      <Box key={`${entry.category}-${index}`}>
                        <Typography variant="caption" color="text.secondary">
                          {entry.category}
                        </Typography>
                        <Typography variant="body2">
                          {renderInlineMarkdown(entry.text)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              ))}
              <Button
                component="a"
                href={GITHUB_CHANGELOG_URL}
                target="_blank"
                rel="noreferrer"
                size="small"
                sx={{ alignSelf: "flex-start" }}
              >
                {t("appSettings.githubChangelog")}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </div>
  );
}
