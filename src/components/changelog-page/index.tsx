import { Box, Container, Stack, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/use-translation.ts";
import { AppHeader } from "../app-header/index.tsx";
import { AppNavigation } from "../app-navigation/index.tsx";

export function ChangelogPage() {
  const { t } = useTranslation();
  const entries = [
    { version: t("changesPage.latest"), title: t("changesPage.latestTitle"), details: t("changesPage.latestDetails") },
    { version: "2.9.0", title: t("changesPage.v290Title"), details: t("changesPage.v290Details") },
    { version: "2.8.0", title: t("changesPage.v280Title"), details: t("changesPage.v280Details") },
    { version: "2.7.0", title: t("changesPage.v270Title"), details: t("changesPage.v270Details") },
    { version: "2.6.0", title: t("changesPage.v260Title"), details: t("changesPage.v260Details") },
  ];

  return (
    <div className="app-shell">
      <AppHeader />
      <AppNavigation />
      <Container component="main" maxWidth="md" sx={{ py: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {t("changesPage.pageTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("changesPage.pageDescription")}
            </Typography>
          </Box>
          {entries.map((entry) => (
            <Box
              component="article"
              key={entry.version}
              sx={{
                border: 1,
                borderColor: "divider",
                borderLeft: "3px solid var(--brand)",
                borderRadius: 1,
                bgcolor: "background.paper",
                p: 1.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {entry.version}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {entry.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {entry.details}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Container>
    </div>
  );
}
