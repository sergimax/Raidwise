import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import changelog from "../../../CHANGELOG.md?raw";
import { useTranslation } from "../../i18n/use-translation.ts";
import { AppHeader } from "../app-header/index.tsx";
import { AppBreadcrumbs } from "../app-breadcrumbs/index.tsx";
import { AppMetaInfo, AppVersionLabel } from "../app-meta-info/index.tsx";

type ChangeEntry = {
  version: string;
  category: string;
  text: string;
};

function getRecentChanges(markdown: string, limit: number): ChangeEntry[] {
  const entries: ChangeEntry[] = [];
  let version = "";
  let category = "";

  for (const line of markdown.split(/\r?\n/)) {
    const release = line.match(/^## \[([^\]]+)\]/);
    if (release) {
      version = release[1];
      category = "";
      continue;
    }

    const section = line.match(/^###\s+(.+)$/);
    if (section) {
      category = section[1];
      continue;
    }

    const change = line.match(/^\s*[-*+]\s+(.+)$/);
    if (change && version && category) {
      entries.push({ version, category, text: change[1] });
      if (entries.length === limit) break;
    }
  }

  return entries;
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

const recentChanges = getRecentChanges(changelog, 10);
const GITHUB_CHANGELOG_URL = "https://github.com/sergimax/Raidwise/blob/main/CHANGELOG.md";

export function AppSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <AppHeader />
      <Container component="main" maxWidth="md" sx={{ py: 3 }}>
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
              <Stack direction="row" spacing={1} alignItems="center">
                <AppMetaInfo />
                <AppVersionLabel />
              </Stack>
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
              {recentChanges.map((entry, index) => (
                <Paper component="article" variant="outlined" key={`${entry.version}-${index}`} sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {entry.version} · {entry.category}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {renderInlineMarkdown(entry.text)}
                  </Typography>
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
